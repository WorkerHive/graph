import { GraphConnector } from "./GraphConnector";
import { GraphFS } from './GraphFS';
export default interface GraphContext {
    connector?: GraphConnector;
    fs?: GraphFS;
    user?: any;
    mail?: any;
    signToken?: (input: any) => string;
}
