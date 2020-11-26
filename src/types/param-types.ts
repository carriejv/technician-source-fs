/** Params for building an FSConfigSource. */
export interface FSConfigSourceParams {
    /** Recurse through subdirectories. */
    recurse?: boolean;
    /** If true, the rootPath param is treated as relative to process.cwd(). */
    relativeRootPath?: boolean;
    /** Throw fs errors instead of treating erroring reads as undefined. */
    throwErrors?: boolean;
}