import { FiniteAutomaton } from './finite-automaton';
import { IVariableMap } from './models/variable-map.model';


export class AFD extends FiniteAutomaton {
    private finiteAutomatonNotDetermined: FiniteAutomaton;
    constructor() {
        super();

        this.finiteAutomatonNotDetermined = new FiniteAutomaton();
    }

    setState(stateNotDetermined: string[][][]): void {
        const value: string[][][] = JSON.parse(JSON.stringify(stateNotDetermined));

        this.finiteAutomatonNotDetermined.setState(value);
        this.state = [
            [
                ...value[0]
            ]
        ]
    }

    setAlphabet(alphabetMap: { [key: string]: number }): void {
        const value = JSON.parse(JSON.stringify(alphabetMap));
        this.finiteAutomatonNotDetermined.setAlphabet(value);
        this.alphabetMap = value;
    }

    setVariables(variablesMap: { [key: string]: IVariableMap }): void {
        const value = JSON.parse(JSON.stringify(variablesMap));
        const inicialVariable = this.generateVariable();

        this.finiteAutomatonNotDetermined.setVariables(value);
        this.variablesMap[inicialVariable] = value[inicialVariable];
    }

    convertToDetermined(): void {

    }
}