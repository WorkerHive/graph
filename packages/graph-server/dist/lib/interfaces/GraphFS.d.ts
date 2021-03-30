export interface FSNode {
    name: string;
    size: number;
    type: 'directory' | 'file';
    mode: number;
    cid?: string;
}
export interface GraphFS {
    ls: (path: string) => FSNode[];
    mkdir: (path: string) => boolean;
    writeFile: (path: string, opts?: {
        create: boolean;
    }) => boolean;
    readFile: (path: string) => any;
}
