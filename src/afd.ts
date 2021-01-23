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
        const mappedVariables = {};
        const NDvariables = this.finiteAutomatonNotDetermined.getVariables();
        let amountNewVariable = 1;

        for (let indexVariable = 0; indexVariable < amountNewVariable; indexVariable++) {
            const newStateVariable = this.getVariabelByIndex(indexVariable);

            const mapaInteracaoComposicao = {};
            for (let variableComposition of newStateVariable.Composition) {
                // this.printTable();
                const statesFromNDVariable = this.finiteAutomatonNotDetermined.getVariableState(NDvariables[variableComposition].Value);

                for (let NDvariableLetterIndex in statesFromNDVariable) {
                    let NDvariableLetter = statesFromNDVariable[NDvariableLetterIndex];
                    if (NDvariableLetter === null) continue;

                    let nextVariableState = NDvariableLetter.length > 0 ? NDvariableLetter[0] : '';

                    if (NDvariableLetter.length > 1) {

                        // Agrupa variáveis e cria o estado novo [concatenações]; Se um deles for terminal, adicionar flag de final
                        nextVariableState = `[${NDvariableLetter.sort().join('')}]`;

                        // Adiciona no mapeamento de estados novos
                        // TODO: Verificar se é terminal
                        this.getAndMapVariablePosition(NDvariableLetter, false);
                        this.setStatePosition(indexVariable, parseInt(NDvariableLetterIndex), nextVariableState);
                        amountNewVariable++;
                        NDvariableLetter.map(v => mappedVariables[v] = nextVariableState);
                    } else if (mapaInteracaoComposicao[NDvariableLetterIndex]) {

                        const composicaoEstadoASerSubstituido = mapaInteracaoComposicao[NDvariableLetterIndex];
                        const composicaoNovoEstado = [...mapaInteracaoComposicao[NDvariableLetterIndex], nextVariableState];

                        // TODO: Verificar se é terminal
                        this.replaceAndMapVariablePosition(composicaoEstadoASerSubstituido, composicaoNovoEstado, false);

                        mapaInteracaoComposicao[NDvariableLetterIndex] = composicaoNovoEstado;

                    } else if (!mappedVariables[nextVariableState]) {

                        mapaInteracaoComposicao[NDvariableLetterIndex] = mapaInteracaoComposicao[NDvariableLetterIndex] || [];
                        mapaInteracaoComposicao[NDvariableLetterIndex].push(nextVariableState);
                       
                        // TODO: Verificar se é terminal
                        this.getAndMapVariablePosition(nextVariableState, false);
                        this.setStatePosition(indexVariable, parseInt(NDvariableLetterIndex), nextVariableState);
                        amountNewVariable++;

                        mappedVariables[nextVariableState] = NDvariableLetter;
                    } else {
                        this.setStatePosition(indexVariable, parseInt(NDvariableLetterIndex), nextVariableState);
                    }
                }
            }
        }
    }
}