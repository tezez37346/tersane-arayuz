import os
import pandas as pd
from gurobipy import Model, GRB, quicksum

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def read_matrix(filename):
    path = os.path.join(BASE_DIR, "data", filename)
    df = pd.read_excel(path, header=None)
    df = df.apply(pd.to_numeric, errors="coerce")
    df = df.dropna(how="all").dropna(axis=1, how="all")
    return df.fillna(0).values.tolist()


def solve_shipyard_model(block_count: int = 35, priority="Dengeli Amaç Fonksiyonu", job_id: int = 6):
    Dur = read_matrix("dur.xlsx")
    Cost = read_matrix("cost.xlsx")
    SkillOK = read_matrix("skillok.xlsx")

    J = 11
    WN = 51

    Jobs = range(1, J + 1)
    Workers = range(1, WN + 1)

    job_names = {
        1: "CNC Ön İmalat",
        2: "CNC Panel",
        3: "Ön İmalat Montaj",
        4: "Ön İmalat Kaynak",
        5: "Panel Montaj",
        6: "Panel Kaynak",
        7: "Blok İmalat Montaj",
        8: "Blok İmalat Kaynak",
        9: "Ön Donatım",
        10: "Erection",
        11: "Boya",
    }

    PR = [
        (1, 2), (1, 3), (2, 5), (3, 4), (4, 7),
        (5, 6), (6, 7), (7, 8), (8, 9), (9, 10), (10, 11)
    ]

    Cap = {
        1: 1, 2: 1, 3: 5, 4: 6, 5: 6, 6: 6,
        7: 6, 8: 6, 9: 4, 10: 5, 11: 5
    }

    ER = {
        1: 8, 2: 8, 3: 12, 4: 20, 5: 12, 6: 20,
        7: 16, 8: 20, 9: 12, 10: 15, 11: 12
    }

    M = 10000

    last_worker_finish = {k: 0 for k in Workers}
    last_worker_job = {k: None for k in Workers}
    used_worker_job = {(k, j): 0 for k in Workers for j in Jobs}
    last_station_finish = {j: 0 for j in Jobs}

    all_assignments = []
    total_obj = 0
    global_cmax = 0

    for block in range(1, block_count + 1):
        m = Model(f"Blok_{block}_Atama")
        m.Params.TimeLimit = 120
        m.Params.OutputFlag = 0

        feasible = {
            (k, j): Dur[k - 1][j - 1] > 0
            for k in Workers
            for j in Jobs
        }

        x = {
            (k, j): m.addVar(vtype=GRB.BINARY, name=f"x_{k}_{j}")
            for k in Workers
            for j in Jobs
            if feasible[k, j]
        }

        qcert = {
            (k, j): m.addVar(vtype=GRB.BINARY, name=f"qcert_{k}_{j}")
            for k, j in x
        }

        repeat_penalty = {
            (k, j): m.addVar(vtype=GRB.BINARY, name=f"repeat_{k}_{j}")
            for k, j in x
        }

        S = m.addVars(Jobs, lb=0, name="S")
        B = m.addVars(Jobs, lb=0, name="B")
        Tact = m.addVars(Jobs, lb=0, name="Tact")
        Cmax = m.addVar(lb=0, name="Cmax")

        for j in Jobs:
            m.addConstr(quicksum(x[k, j] for k in Workers if (k, j) in x) == Cap[j])

        for k in Workers:
            m.addConstr(quicksum(x[k, j] for j in Jobs if (k, j) in x) == 1)

        # Aynı işçi aynı işi ardışık bloklarda tekrar almasın.
        # Eğer çok dar uygunluk varsa model infeasible olmasın diye ceza ile desteklenir.
        for k, j in x:
            if last_worker_job[k] == j:
                m.addConstr(x[k, j] <= 0)

        for k, j in x:
            skill_ok = int(SkillOK[k - 1][j - 1])
            m.addConstr(qcert[k, j] >= x[k, j] - skill_ok)
            m.addConstr(qcert[k, j] <= x[k, j])
            m.addConstr(qcert[k, j] <= 1 - skill_ok)

        for k, j in x:
            if used_worker_job[k, j] > 0:
                m.addConstr(repeat_penalty[k, j] >= x[k, j])
            else:
                m.addConstr(repeat_penalty[k, j] == 0)

        for j in Jobs:
            m.addConstr(
                Tact[j] ==
                quicksum(Dur[k - 1][j - 1] * x[k, j] for k in Workers if (k, j) in x) / Cap[j]
            )
            m.addConstr(B[j] == S[j] + Tact[j])

        for pre, suc in PR:
            m.addConstr(S[suc] >= B[pre])

        for k, j in x:
            m.addConstr(S[j] >= last_worker_finish[k] - M * (1 - x[k, j]))

        if block >= 2:
            m.addConstr(S[1] >= last_station_finish[2])
            m.addConstr(S[2] >= last_station_finish[3])
            m.addConstr(S[3] >= last_station_finish[4])
            m.addConstr(S[4] >= last_station_finish[5])
            m.addConstr(S[5] >= last_station_finish[6])
            m.addConstr(S[6] >= last_station_finish[7])
            m.addConstr(S[7] >= last_station_finish[8])
            m.addConstr(S[8] >= last_station_finish[9])
            m.addConstr(S[9] >= last_station_finish[10])
            m.addConstr(S[10] >= last_station_finish[11])

        for j in Jobs:
            m.addConstr(Cmax >= B[j])

        Z_pref = quicksum(Cost[k - 1][j - 1] * x[k, j] for k, j in x)
        Z_er = quicksum(ER[j] * x[k, j] for k, j in x)
        Z_cert = quicksum(qcert[k, j] for k, j in qcert)
        Z_repeat = quicksum(repeat_penalty[k, j] for k, j in repeat_penalty)

        

                # =====================================================
        # ÖNCELİK TİPİNE GÖRE AĞIRLIK DEĞİŞİMİ
        # =====================================================

        if priority == "Temin Süresi Öncelikli":

            w_cmax = 1.20
            w_pref = 0.05
            w_er = 0.05
            w_cert = 2.00
            w_repeat = 0.50

        elif priority == "Ergonomi Öncelikli":

            w_cmax = 0.20
            w_pref = 0.05
            w_er = 1.20
            w_cert = 2.00
            w_repeat = 0.50

        elif priority == "Sertifika Öncelikli":

            w_cmax = 0.20
            w_pref = 0.05
            w_er = 0.10
            w_cert = 12.00
            w_repeat = 0.50

        elif priority == "İş Yükü Dengesi Öncelikli":

            w_cmax = 0.25
            w_pref = 0.05
            w_er = 0.15
            w_cert = 2.00
            w_repeat = 8.00

        else:

            # Dengeli yapı
            w_cmax = 0.55
            w_pref = 0.20
            w_er = 0.20
            w_cert = 5.00
            w_repeat = 2.00

        # =====================================================
        # AMAÇ FONKSİYONU
        # =====================================================

        m.setObjective(
            w_cmax * Cmax
            + w_pref * Z_pref
            + w_er * Z_er
            + w_cert * Z_cert
            + w_repeat * Z_repeat,
            GRB.MINIMIZE
        )

        m.optimize()

        if m.Status not in [GRB.OPTIMAL, GRB.TIME_LIMIT]:
            return {
                "status": "INFEASIBLE_OR_NO_SOLUTION",
                "block_count": block_count,
                "cmax": None,
                "assignments": [],
                "message": f"{block}. blok çözülemedi."
            }

        for j in Jobs:
            selected = []
            for k in Workers:
                if (k, j) in x and x[k, j].X > 0.5:
                    selected.append(f"W{k}")
                    last_worker_finish[k] = B[j].X
                    last_worker_job[k] = j
                    used_worker_job[k, j] += 1

            all_assignments.append({
                "block": block,
                "job_id": j,
                "job": job_names[j],
                "workers": selected,
                "worker_count": len(selected),
                "start": round(S[j].X, 2),
                "finish": round(B[j].X, 2),
                "duration": round(Tact[j].X, 2),
                "ert": ER[j],
            })

            last_station_finish[j] = B[j].X
            global_cmax = max(global_cmax, B[j].X)

        total_obj += m.ObjVal

    selected_job = job_id
    candidate_workers = []

    for k in Workers:
        if Dur[k - 1][selected_job - 1] > 0:
            cert = int(SkillOK[k - 1][selected_job - 1]) * 100
            duration = float(Dur[k - 1][selected_job - 1])
            cost = float(Cost[k - 1][selected_job - 1])
            ert = ER[selected_job]
            repeat_count = used_worker_job[k, selected_job]

            repeat_label = "Düşük" if repeat_count <= 1 else "Orta" if repeat_count <= 2 else "Yüksek"


            if priority == "Temin Süresi Öncelikli":
                a, b, c, d, e = 0.50, 0.15, 0.10, 0.15, 0.10
            elif priority == "Ergonomi Öncelikli":
                a, b, c, d, e = 0.15, 0.15, 0.10, 0.50, 0.10
            elif priority == "Sertifika Öncelikli":
                a, b, c, d, e = 0.15, 0.50, 0.10, 0.15, 0.10
            elif priority == "İş Yükü Dengesi Öncelikli":
                a, b, c, d, e = 0.15, 0.15, 0.45, 0.15, 0.10
            else:
                a, b, c, d, e = 0.30, 0.25, 0.15, 0.20, 0.10

            score = (
                a * (1 / max(duration, 1))
                + b * (cert / 100)
                + c * (1 / max(cost, 1))
                + d * (1 - ert / 100)
                + e * (1 / (repeat_count + 1))
            )

            candidate_workers.append({
                "worker": f"W{k}",
                "cert": cert,
                "ert": ert,
                "fatigue": round(ert * 0.30 + repeat_count * 5, 2),
                "cost": round(cost, 2),
                "duration": round(duration, 2),
                "repeat": repeat_label,
                "score": round(score, 3),
            })

    candidate_workers = sorted(candidate_workers, key=lambda x: x["score"], reverse=True)[:8]

    for i, row in enumerate(candidate_workers, start=1):
        row["rank"] = i

    best = candidate_workers[0] if candidate_workers else None

    dashboard = {
        "best_worker": best["worker"] if best else "-",
        "eligible_workers": sum(1 for k in Workers if int(SkillOK[k - 1][selected_job - 1]) == 1 and Dur[k - 1][selected_job - 1] > 0),
        "total_workers": WN,
        "best_duration": best["duration"] if best else "-",
        "min_ert": best["ert"] if best else "-",
        "best_score": best["score"] if best else "-",
        "selected_job": job_names[selected_job],
        "capacity": Cap[selected_job],
        "assigned_worker_count": Cap[selected_job],
        "candidate_workers": candidate_workers,
    }

    return {
        "status": "OPTIMAL",
        "block_count": block_count,
        "cmax": round(global_cmax, 2),
        "objective": round(total_obj, 2),
        "method": "Rolling Window - Tekrar Atama Kontrollü",
        "assignments": all_assignments,
        "dashboard": dashboard,
    }