export declare class Spinal {
    static instance: any;
    connectPromise: any;
    conn: spinal.FileSystem;
    static getInstance(): Spinal;
    private constructor();
    getauth(): {
        "username": string;
        "password": string;
    };
    disconnect(): void;
    connect(): any;
    load(serve_id: any): Promise<{}>;
}
export default Spinal;
