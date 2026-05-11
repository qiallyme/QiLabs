import { QiObject } from './types';
import { contact } from './contact';
import { caseObject } from './case';
import { chore } from './chore';
import { expense } from './expense';
import { medication } from './medication';
import { appointment } from './appointment';
import { patient } from './patient';

export const qiRegistry: Record<string, QiObject> = {
    contact,
    case: caseObject,
    chore,
    expense,
    medication,
    appointment,
    patient,
};

export type { QiObject };
