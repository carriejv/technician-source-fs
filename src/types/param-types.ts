/** Params for building an FSConfigSource. */
export interface FSConfigSourceParams {
    /** Recurse through subdirectories. */
    recurse: boolean;
    /** Throw fs errors instead of treating erroring reads as undefined. */
    throwErrors: boolean;
}