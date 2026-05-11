import pandas as pd
import tkinter as tk
from tkinter import filedialog, messagebox
import os
import sys

def convert_cashapp_to_qb():
    # --- 1. Setup the UI to ask for the file ---
    root = tk.Tk()
    root.withdraw() # Hide the main window

    print("Please select your Cash App CSV file...")
    file_path = filedialog.askopenfilename(
        title="Select Cash App CSV",
        filetypes=[("CSV files", "*.csv"), ("All files", "*.*")]
    )

    if not file_path:
        print("No file selected. Exiting.")
        return

    try:
        # --- 2. Load the Data ---
        # Cash App CSVs sometimes have weird headers, so we assume standard loading
        df = pd.read_csv(file_path)

        # Standardize column names (strip whitespace)
        df.columns = [c.strip() for c in df.columns]

        # --- 3. Create Target DataFrame ---
        # We will build the new data row by row or column by column
        qb_data = pd.DataFrame()

        # --- LOGIC 1: DATE (Format MM/DD/YYYY) ---
        # Convert to datetime objects first, then format
        # Cash App usually provides 'Date' in ISO format or similar.
        if 'Date' in df.columns:
            qb_data['DATE'] = pd.to_datetime(df['Date']).dt.strftime('%m/%d/%Y')
        else:
            raise KeyError("Column 'Date' not found in source file.")

        # --- LOGIC 2: DESCRIPTION (Concatenation) ---
        # Logic: Account + Transaction Type + Notes + Status + Name of sender/receiver
        # We fill NaN (empty) values with empty strings so "nan" doesn't appear in text
        
        # Check which 'Name' column exists (Cash App sometimes varies)
        name_col = 'Name of sender/receiver'
        if name_col not in df.columns:
            # Fallback to common Cash App headers if the exact name isn't there
            if 'Name' in df.columns: name_col = 'Name'
            elif 'Description' in df.columns: name_col = 'Description'
        
        # Helper to get column safely with default empty string
        def get_col(col_name):
            if col_name in df.columns:
                return df[col_name].fillna('').astype(str)
            return pd.Series([''] * len(df))

        qb_data['DESCRIPTION'] = (
            get_col('Account') + " " +
            get_col('Transaction Type') + " " +
            get_col('Notes') + " " +
            get_col('Status') + " " +
            get_col(name_col)
        )
        # Clean up double spaces resulting from empty fields
        qb_data['DESCRIPTION'] = qb_data['DESCRIPTION'].str.replace(r'\s+', ' ', regex=True).str.strip()

        # --- LOGIC 3 & 4: MONEY IN / MONEY SPENT ---
        # Logic Provided: 
        # MONEY IN = Negative amounts in column Amount
        # MONEY SPENT = Positive amounts in column Amount
        
        if 'Amount' not in df.columns:
            # Cash App amounts often come formatted like "$1,234.56"
            # We need to clean this if it's treated as a string, but usually CSVs are clean numbers.
            # We will attempt to find the amount column.
            raise KeyError("Column 'Amount' not found in source file.")
        
        # Ensure Amount is numeric (remove currency symbols if present)
        clean_amount = df['Amount'].replace('[\$,]', '', regex=True).astype(float)

        # Money In (Logic: Negative amounts -> Converted to Positive for QB)
        qb_data['MONEY IN'] = clean_amount.apply(lambda x: abs(x) if x < 0 else None)

        # Money Spent (Logic: Positive amounts)
        qb_data['MONEY SPENT'] = clean_amount.apply(lambda x: x if x > 0 else None)

        # --- LOGIC 5: CHECK NUMBER ---
        # Logic: Transaction ID
        if 'Transaction ID' in df.columns:
            qb_data['CHECK NUMBER'] = df['Transaction ID']
        else:
             qb_data['CHECK NUMBER'] = ''

        # --- 4. Export ---
        # Define output filename
        directory = os.path.dirname(file_path)
        filename = os.path.basename(file_path)
        name, ext = os.path.splitext(filename)
        output_path = os.path.join(directory, f"{name}_QB_Ready.csv")

        # Select only the required columns
        final_columns = ['DATE', 'DESCRIPTION', 'MONEY IN', 'MONEY SPENT', 'CHECK NUMBER']
        qb_data = qb_data[final_columns]

        # Save to CSV
        qb_data.to_csv(output_path, index=False)

        print(f"Success! File saved to: {output_path}")
        messagebox.showinfo("Success", f"Conversion Complete!\nSaved as: {output_path}")

    except Exception as e:
        print(f"Error: {e}")
        messagebox.showerror("Error", f"An error occurred:\n{e}")

if __name__ == "__main__":
    convert_cashapp_to_qb()