import { IComposition } from './composition.model';


export interface IRule {
    Variable: string;
    Conditions: IComposition[][];
}