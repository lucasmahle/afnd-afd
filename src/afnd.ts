import { IRule } from './models/rule.model';
import { ConditionType } from './models/condition.enum';
import { FiniteAutomaton } from './finite-automaton';

export class AFND extends FiniteAutomaton {
    private tokens: string[];
    private grammar: IRule[];


    private getVariable(isFirstVariable: boolean = false, isTerminal: boolean = false): string {
        const variablesCount = Object.keys(this.variablesMap).length - 1;
        const variable = this.generateVariable(!isFirstVariable ? variablesCount : -1);

        this.getAndMapVariablePosition(variable, isTerminal);
        return variable;
    }

    private setVariableAsTerminal(variable: string): void {
        if (!this.isVariableMapped(variable))
            return;

        this.variablesMap[variable].IsTerminal = true;
    }

    getState(){
        return this.state;
    }

    getAlphabet(){
        return this.alphabetMap;
    }

    getVariables(){
        return this.variablesMap;
    }

    setTokens(tokens: string[]) {
        this.tokens = tokens;
    }

    setGrammar(grammar: IRule[]) {
        this.grammar = grammar;
    }

    runTokens() {
        for (let token of this.tokens) {
            let lastVariable = this.getVariable(true);

            for (let i = 0, s = token.length; i < s; i++) {
                let alphabet = token[i];
                const isLastCharater = i == (s - 1);

                const variable = this.getVariable(false, isLastCharater);
                const lastVariableIndex = this.getAndMapVariablePosition(lastVariable);
                const alphabetIndex = this.getAndMapAlphabetPosition(alphabet);

                lastVariable = variable;

                this.setStatePosition(lastVariableIndex, alphabetIndex, variable);
            }
        }
    }

    runGrammar() {
        let initialVariable = this.getVariable(true);
        const variablesRemap: { [key: string]: string } = {};

        for (let rule of this.grammar) {
            let ruleVariableIndex = -1;

            if (rule.Variable == initialVariable) {
                ruleVariableIndex = this.getAndMapVariablePosition(initialVariable);
            } else if(rule.Variable in variablesRemap) {
                ruleVariableIndex = this.getAndMapVariablePosition(variablesRemap[rule.Variable]);
            }

            for (let condition of rule.Conditions) {
                let isTerminal: boolean = condition.filter(c => c.Type == ConditionType.Epsilon).length > 0;
                let alphabetIndex = -1;
                let variable = '';

                for (let composition of condition) {
                    if (composition.Type == ConditionType.Alphabet) {
                        alphabetIndex = this.getAndMapAlphabetPosition(composition.Content);
                    }

                    if (composition.Type == ConditionType.Variable) {
                        if (!(composition.Content in variablesRemap)) {
                            const variable = this.getVariable(false, isTerminal);
                            variablesRemap[composition.Content] = variable;
                        }

                        variable = variablesRemap[composition.Content];
                    }

                    if (isTerminal && (rule.Variable in variablesRemap)) {
                        this.setVariableAsTerminal(variablesRemap[rule.Variable]);
                    }
                }

                if (ruleVariableIndex >= 0 && alphabetIndex >= 0 && variable != '') {
                    this.setStatePosition(ruleVariableIndex, alphabetIndex, variable);
                }
            }
        }
    }
}