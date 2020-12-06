import { IComposition } from './models/composition.model';
import { ConditionType } from './models/condition.enum';
import { IRule } from './models/rule.model';
import { 
    LINE_SEPARATOR,
    CONDITION_SEPARATOR,
    VARIABLE_PATTERN,
    EPSILON,
    CONDITION_ATTR,
 } from './consts';

 
function filterInputSplit(content: string, separator: string = LINE_SEPARATOR) {
    const lines = content.split(separator);

    return lines.filter(line => (line || '').length > 0);
}


export function RuleParse(inputConditions: string): IComposition[][] {
    const conditions = filterInputSplit(inputConditions, CONDITION_SEPARATOR);

    return conditions.map(condition => {
        const compositionParts = condition.split(VARIABLE_PATTERN).filter(v => v != '');

        return compositionParts.map(val => {
            const composition = {
                Content: val,
                Type: 0,
            };

            if (val === EPSILON)
                composition.Type = ConditionType.Epsilon;
            else if (VARIABLE_PATTERN.test(val))
                composition.Type = ConditionType.Variable;
            else
                composition.Type = ConditionType.Alphabet;

                return composition;
        })
    })
}

export function GrammarParser(input: string): IRule[] {
    const rules = filterInputSplit(input);

    return rules.map(rule => {
        const [variable, conditions] = rule.split(CONDITION_ATTR);
        
        return <IRule>{
            Variable: variable,
            Conditions: RuleParse(conditions)
        };
    });
}

export function TokenParser(input: string) {
    return filterInputSplit(input);
}