import csv
import json
import os

# --- CONFIGURATION (The Logic We Reverse Engineered) ---
CONDITION_AMOUNT = 10
CONDITION_TEXT = 1
CONDITION_MERCHANT = 6

ACTION_CATEGORY = 0
ACTION_RENAME_PAYEE = 5
ACTION_MEMO = 9
ACTION_TAGS = 11
ACTION_REVIEWED = 8

CSV_FILE = 'rules.csv'

class RuleManager:
    def __init__(self):
        self.rules = []
        self.load_rules()

    def load_rules(self):
        """Reads the CSV and parses the JSON strings into Python dicts."""
        if not os.path.exists(CSV_FILE):
            print(f"Creating new {CSV_FILE}...")
            with open(CSV_FILE, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(["RuleName", "RuleConditions", "RuleActions"])
            return

        with open(CSV_FILE, 'r', newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    # Parse the JSON strings back into objects
                    row['RuleConditions'] = json.loads(row['RuleConditions'])
                    row['RuleActions'] = json.loads(row['RuleActions'])
                    self.rules.append(row)
                except json.JSONDecodeError:
                    print(f"Skipping corrupt row: {row['RuleName']}")

    def save_rules(self):
        """Writes the rules back to CSV with proper JSON formatting."""
        with open(CSV_FILE, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(["RuleName", "RuleConditions", "RuleActions"])
            
            for rule in self.rules:
                # Convert dicts back to JSON strings for the CSV
                json_conditions = json.dumps(rule['RuleConditions'], separators=(',', ':'))
                json_actions = json.dumps(rule['RuleActions'], separators=(',', ':'))
                writer.writerow([rule['RuleName'], json_conditions, json_actions])
        
        print(f"\n[Success] Saved {len(self.rules)} rules to {CSV_FILE}")

    def check_duplicate(self, rule_name):
        """Returns the index of a rule if it exists, else -1."""
        for idx, rule in enumerate(self.rules):
            if rule['RuleName'].lower() == rule_name.lower():
                return idx
        return -1

    def create_rule(self):
        print("\n--- NEW RULE WIZARD ---")
        
        # 1. Basic Info
        name = input("Rule Name (e.g., 'Food - McDonald's'): ").strip()
        if not name: return

        # Check Duplicates
        dup_idx = self.check_duplicate(name)
        if dup_idx != -1:
            print(f"!! Warning: A rule named '{name}' already exists.")
            overwrite = input("Overwrite it? (y/n): ").lower()
            if overwrite != 'y': return
        
        # 2. Conditions (The IF part)
        print("\n[CONDITIONS]")
        keyword = input("Text to match (Bank Description): ").strip()
        
        conditions_list = [
            {"ruleType": CONDITION_AMOUNT, "value": "-1"}, # Default: Any Amount
            {"ruleType": CONDITION_TEXT, "value": keyword},
            {"ruleType": CONDITION_MERCHANT, "value": keyword} # We default Merchant to match keyword for safety
        ]

        # 3. Actions (The THEN part)
        print("\n[ACTIONS]")
        category = input("QB Category (e.g., 'Meals:Entertainment'): ").strip()
        payee = input("Rename Payee to (e.g., 'McDonalds'): ").strip()
        memo = input("Memo/Note (Optional - press Enter to skip): ").strip()

        actions_list = [
            {"actionType": ACTION_CATEGORY, "value": category},
            {"actionType": ACTION_RENAME_PAYEE, "value": payee},
            {"actionType": ACTION_TAGS, "value": []}, # Empty tags as standard
            {"actionType": ACTION_REVIEWED, "value": True} # Auto-add
        ]
        
        if memo:
            actions_list.append({"actionType": ACTION_MEMO, "value": memo})

        # 4. Construct Final Object
        new_rule = {
            "RuleName": name,
            "RuleConditions": {
                "ruleConditions": conditions_list,
                "isAndRule": False # Defaulting to OR logic as it's safer for bank text
            },
            "RuleActions": {
                "ruleActions": actions_list
            }
        }

        if dup_idx != -1:
            self.rules[dup_idx] = new_rule
            print(f"Updated rule: {name}")
        else:
            self.rules.append(new_rule)
            print(f"Added rule: {name}")

    def list_rules(self):
        print("\n--- CURRENT RULES ---")
        print(f"{'#':<4} {'Rule Name':<30} {'Category':<30} {'Payee':<20}")
        print("-" * 85)
        for idx, rule in enumerate(self.rules):
            # Extract category and payee for display
            cat = next((x['value'] for x in rule['RuleActions']['ruleActions'] if x['actionType'] == ACTION_CATEGORY), "N/A")
            payee = next((x['value'] for x in rule['RuleActions']['ruleActions'] if x['actionType'] == ACTION_RENAME_PAYEE), "N/A")
            print(f"{idx+1:<4} {rule['RuleName']:<30} {cat:<30} {payee:<20}")

    def run(self):
        while True:
            print("\nMAIN MENU")
            print("1. List Rules")
            print("2. Add / Update Rule")
            print("3. Save & Exit")
            choice = input("Select: ")

            if choice == '1':
                self.list_rules()
            elif choice == '2':
                self.create_rule()
            elif choice == '3':
                self.save_rules()
                break
            else:
                print("Invalid selection.")

if __name__ == "__main__":
    app = RuleManager()
    app.run()