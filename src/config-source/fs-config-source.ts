import * as fs from 'fs';
import * as path from 'path';
import { ConfigSource, ConfigSourceSync } from 'technician';
import { FSConfigSourceParams } from '../types/param-types';

/**
 * A Technician ConfigSource for accessing the local filesystem.
 * The FSConfigSource uses filenames as default keys and returns
 * file contents as values.
 */
export class FSConfigSource implements ConfigSource, ConfigSourceSync {

    /** Root path for all file reads. */
    private rootPath: string;

    /**
     * Builds a new FSConfigSource.
     * @param rootPath Root path to read from. Default is process.cwd().
     * @param params Optional params object for miscellaneous config.
     * @constructor FSConfigSource
     * @throws ENOTDIR if rootPath is not a directory or ENOENT if it does not exist.
     */
    constructor(rootPath?: string, private params?: FSConfigSourceParams) {
        // Custom root path
        if(rootPath) {
            this.rootPath = params?.relativeRootPath ? path.join(process.cwd(), rootPath) : rootPath;
        }
        // Default root path - process.cwd();
        else {
            this.rootPath = process.cwd();
        }
        // This will directly throw an ENOENT fs error if rootPath does not exist.
        if(!fs.statSync(this.rootPath).isDirectory()) {
            throw new Error(`ENOTDIR: FSConfigSource rootPath [${rootPath}] must be a directory.`);
        }
    }

    /** 
     * Reads the contents of a file on disk relative to `rootPath`.
     * @see {@link ConfigSource#read}
     * @throws Will throw errors from node `fs` if `throwErrors` is set.
     */
    public async read(key: string): Promise<Buffer | undefined> {
        // Read in the target secret file
        try {
            return await fs.promises.readFile(path.join(this.rootPath, key));
        }
        catch(err) {
            // Errors are not thrown by default, just an undefined data buffer for the interpreter.
            if(!this.params?.throwErrors) {
                return undefined;
            }
            throw err;
        }
    }

    /**
     * Reads the contents of a directory, returning a {filename: contents} object.
     * If `recurse` is set to true, the file path relative to the `rootPath` is used as the key.
     * If a key exists but has an undefined value, an error occurred reading the file.
     * @see {@link ConfigSource#readAll}
     * @throws Will throw errors from node `fs` if `throwFSErrors` is set.
     */
    public async readAll(): Promise<{[key: string]: Buffer  | undefined}> {
        const result: {[key: string]: Buffer  | undefined} = {};
        // Read root directory
        for(const file of await this.list()) {
            result[file] = await this.read(file);
        }
        return result;
    }

    /**
     * Lists the files visible to the FSConfigSource.
     * If `recurse` is set to true, the file path relative to the `rootPath` is used as the key.
     * Keys for all visible files are included, even if they are not necessarily readable.
     * @see {@link ConfigSource#readAll}
     * @throws Will throw errors from node `fs` if `throwFSErrors` is set.
     */
    public async list(): Promise<string[]> {
        return await this.listSubdir();
    }

    /** 
     * Reads the contents of a file on disk relative to `rootPath`.
     * @see {@link ConfigSource#read}
     * @throws Will throw errors from node `fs` if `throwErrors` is set.
     */
    public readSync(key: string): Buffer | undefined {
        // Read in the target secret file
        try {
            return fs.readFileSync(path.join(this.rootPath, key));
        }
        catch(err) {
            // Errors are not thrown by default, just an undefined data buffer for the interpreter.
            if(!this.params?.throwErrors) {
                return undefined;
            }
            throw err;
        }
    }

    /**
     * Reads the contents of a directory, returning a {filename: contents} object.
     * If `recurse` is set to true, the file path relative to the `rootPath` is used as the key.
     * If a key exists but has an undefined value, an error occurred reading the file.
     * @see {@link ConfigSource#readAll}
     * @throws Will throw errors from node `fs` if `throwFSErrors` is set.
     */
    public readAllSync(): {[key: string]: Buffer  | undefined} {
        const result: {[key: string]: Buffer  | undefined} = {};
        // Read root directory
        for(const file of this.listSync()) {
            result[file] = this.readSync(file);
        }
        return result;
    }

    /**
     * Lists the files visible to the FSConfigSource.
     * If `recurse` is set to true, the file path relative to the `rootPath` is used as the key.
     * Keys for all visible files are included, even if they are not necessarily readable.
     * @see {@link ConfigSource#readAll}
     * @throws Will throw errors from node `fs` if `throwFSErrors` is set.
     */
    public listSync(): string[] {
        return this.listSubdirSync();
    }

    /** 
     * Internal function for recursively listing subdirectories.
     * This exists so that the public API of `list()` remains consistent w/ no params.
     * @param dir Relative path to a subdirectory.
     */
    private async listSubdir(dir?: string): Promise<string[]> {
        let result: string[] = [];
        const tgtPath = dir ? path.join(this.rootPath, dir) : this.rootPath;
        // Read root directory.
        for(const file of await fs.promises.readdir(tgtPath)) {
            const stat = await fs.promises.stat(path.join(tgtPath, file));
            // Check if directory.
            if(stat.isDirectory()) {
                // If recurse = true, recurse.
                if(this.params?.recurse) {
                    result = result.concat(await this.listSubdir(file));
                }
                // Else, skip subdirs.
                else {
                    continue;
                }
            }
            // If file, add the path (with possible directory path).
            else {
                result.push(dir ? path.join(dir, file) : file);
            }
        }
        return result;
    }

    /** 
     * Internal function for recursively listing subdirectories. Sync edition.
     * This exists so that the public API of `list()` remains consistent w/ no params.
     * @param dir Relative path to a subdirectory.
     */
    private listSubdirSync(dir?: string): string[] {
        let result: string[] = [];
        const tgtPath = dir ? path.join(this.rootPath, dir) : this.rootPath;
        // Read root directory.
        for(const file of fs.readdirSync(tgtPath)) {
            const stat = fs.statSync(path.join(tgtPath, file));
            // Check if directory.
            if(stat.isDirectory()) {
                // If recurse = true, recurse.
                if(this.params?.recurse) {
                    result = result.concat(this.listSubdirSync(file));
                }
                // Else, skip subdirs.
                else {
                    continue;
                }
            }
            // If file, add the path (with possible directory path).
            else {
                result.push(dir ? path.join(dir, file) : file);
            }
        }
        return result;
    }


}
