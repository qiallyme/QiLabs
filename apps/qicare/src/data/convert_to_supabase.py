import pandas as pd
import os
from datetime import datetime

def xlsx_to_supabase_sql(xlsx_path="care-sheets.xlsx", output_sql="care_db.sql"):
    if not os.path.exists(xlsx_path):
        print(f"❌ File not found: {xlsx_path}")
        return

    xls = pd.ExcelFile(xlsx_path)
    sql_lines = ["-- =================================================",
                 "-- Supabase SQL generated from care-sheets.xlsx",
                 f"-- Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
                 "-- Run this file in Supabase SQL Editor",
                 "-- ================================================\n"]

    for sheet_name in xls.sheet_names:
        df = pd.read_excel(xlsx_path, sheet_name=sheet_name, dtype=str)  # keep everything as string first
        if df.empty:
            continue

        # Clean column names for Postgres
        df.columns = [col.strip().replace(" ", "_").replace("-", "_").lower() for col in df.columns]
        table_name = sheet_name.lower().replace(" ", "_").replace("-", "_")

        # CREATE TABLE (simple but correct types)
        create_stmt = f"CREATE TABLE IF NOT EXISTS {table_name} (\n    id BIGSERIAL PRIMARY KEY,\n"
        for col in df.columns:
            if any(x in col for x in ["date", "expiration", "prescribed", "filled", "created_at", "appointment_date"]):
                col_type = "DATE"
            elif any(x in col for x in ["low_stock_alert", "is_emergency", "active", "configured"]):
                col_type = "BOOLEAN"
            elif any(x in col for x in ["quantity", "reps", "threshold", "systolic", "diastolic", "pulse", "o2", "weight", "bmi", "refills"]):
                col_type = "INTEGER"
            else:
                col_type = "TEXT"
            create_stmt += f"    {col} {col_type},\n"
        create_stmt = create_stmt.rstrip(",\n") + "\n);\n\n"
        sql_lines.append(create_stmt)

        # INSERT statements
        for _, row in df.iterrows():
            cols = ", ".join(df.columns)
            values = []
            for col in df.columns:
                val = row[col]
                if pd.isna(val) or val == "" or val == "nan":
                    values.append("NULL")
                elif col_type == "BOOLEAN" and str(val).lower() in ["true", "false", "1", "0", "yes", "no"]:
                    values.append("TRUE" if str(val).lower() in ["true", "1", "yes"] else "FALSE")
                elif "date" in col and len(str(val)) > 8:
                    values.append(f"'{val}'")
                elif isinstance(val, (int, float)) or val.isdigit():
                    values.append(str(val))
                else:
                    clean_val = str(val).replace("'", "''")
                    values.append(f"'{clean_val}'")
            insert_stmt = f"INSERT INTO {table_name} ({cols}) VALUES ({', '.join(values)});\n"
            sql_lines.append(insert_stmt)

        sql_lines.append("-- End of table " + table_name + "\n")

    # Write file
    with open(output_sql, "w", encoding="utf-8") as f:
        f.write("\n".join(sql_lines))

    print(f"✅ SUCCESS! SQL file created: {output_sql}")
    print(f"   Tables created: {len(xls.sheet_names)}")
    print("   Just open Supabase → SQL Editor → paste or upload the file.")

if __name__ == "__main__":
    xlsx_to_supabase_sql()