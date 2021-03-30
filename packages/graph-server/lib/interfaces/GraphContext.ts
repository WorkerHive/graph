import {GraphConnector} from "./GraphConnector";
import { GraphFS } from './GraphFS';
//import MessageQueue from "@workerhive/mq"

export default interface GraphContext {
    connector?: GraphConnector;
    fs?: GraphFS;
//    mq?: MessageQueue;
    user?: any;
    mail?: any;
    signToken?: (input: any) => string;
}