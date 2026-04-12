import pandas as pd
import os
import uuid
from datetime import datetime

# =================================================
# QiOS Data Migrator: care-sheets.xlsx -> QiOS SQL
# Target Schema: care, inventory
# =================================================

XLSX_PATH = "care-sheets.xlsx"
OUTPUT_SQL = "qios_care_migration.sql"
TENANT_ID = "00000000-0000-0000-0000-000000000001" # Placeholder for initial household

def migrate():
    if not os.path.exists(XLSX_PATH):
        print(f"❌ File not found: {XLSX_PATH}")
        return

    xls = pd.ExcelFile(XLSX_PATH)
    sql_lines = [
        "-- QiOS COMPLIANT MIGRATION",
        f"-- Generated: {datetime.now().isoformat()}",
        f"SET search_path TO care, inventory, public;",
        "\n"
    ]

    # Map sheets to QiOS tables
    mapping = {
        "medications": "care.medications",
        "otc": "care.medications",
        "equipment": "inventory.items",
        "appointments": "care.appointments",
        "vitals": "care.vitals",
        "usage": "care.activity_log"
    }

    for sheet_name, table_name in mapping.items():
        if sheet_name not in xls.sheet_names:
            continue
            
        df = pd.read_excel(XLSX_PATH, sheet_name=sheet_name, dtype=str)
        df.columns = [col.strip().replace(" ", "_").replace("-", "_").lower() for col in df.columns]
        
        for _, row in df.iterrows():
            cols = ["id", "tenant_id"] + list(df.columns)
            vals = [f"'{uuid.uuid4()}'", f"'{TENANT_ID}'"]
            
            for col in df.columns:
                val = row[col]
                if pd.isna(val) or val == "" or str(val).lower() == "nan":
                    vals.append("NULL")
                else:
                    clean_val = str(val).replace("'", "''")
                    vals.append(f"'{clean_val}'")
            
            sql_lines.append(f"INSERT INTO {table_name} ({', '.join(cols)}) VALUES ({', '.join(vals)});")

    with open(OUTPUT_SQL, "w", encoding="utf-8") as f:
        f.write("\n".join(sql_lines))

    print(f"SUCCESS! Created {OUTPUT_SQL} with QiOS-compliant inserts.")

if __name__ == "__main__":
    migrate()
