import { z } from 'zod';
import { QiObject } from '../objects/types';

export function createZodFromObject(obj: QiObject) {
    const shape: Record<string, z.ZodTypeAny> = {};

    obj.fields.forEach(f => {
        let schema: z.ZodTypeAny;

        switch (f.type) {
            case 'text': schema = z.string(); break;
            case 'number': schema = z.coerce.number(); break;
            case 'date': schema = z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)); break;
            case 'boolean': schema = z.boolean(); break;
            default: schema = z.any();
        }

        if (!f.required) {
            schema = schema.optional().nullable();
        }

        shape[f.key] = schema;
    });

    return z.object(shape);
}

export function validateRow(obj: QiObject, data: any) {
    const schema = createZodFromObject(obj);
    return schema.safeParse(data);
}
