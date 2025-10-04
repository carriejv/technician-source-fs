import * as path from 'path';
import { expect } from 'chai';
import { Technician } from 'technician';
import { FSConfigSource } from '../src';

const TEST_DIR = 'test/resources';
const EXPECTED_TEST_TXT = Buffer.from('This is a test file.');
const EXPECTED_SECRET_TXT = Buffer.from('This is a super secret file.');

describe('FSConfigSource', () => {

    describe('& Integration', () => {

        it('should be readable via Technician as a ConfigSource.', async () => {
            // Build and configure Technician
            const tech = new Technician(new FSConfigSource(TEST_DIR, {relativeRootPath: true}));

            // Attempt a read through Technician
            const result = await tech.read('test.txt');

            // Assertions
            expect(result).to.deep.equal(EXPECTED_TEST_TXT);
        });

    });

    describe ('+ Positive', () => {

        it('should build.', async () => {
            expect(new FSConfigSource()).to.be.instanceOf(FSConfigSource);
        });

        it('should build with a custom rootPath.', async () => {
            expect(new FSConfigSource(path.resolve(__dirname))).to.be.instanceOf(FSConfigSource);
        });

        it('should build with a relative custom rootPath.', async () => {
            expect(new FSConfigSource('src', {relativeRootPath: true})).to.be.instanceOf(FSConfigSource);
        });

        describe('#read', () => {

            it('should read a file, returning its contents as a buffer.', async () => {
                // Build an FSConfigSource
                const fscs = new FSConfigSource(TEST_DIR, {relativeRootPath: true});

                // Read a file
                const result = await fscs.read('test.txt');

                // Assertions
                expect(result).to.deep.equal(EXPECTED_TEST_TXT);
            });

        });

        describe('#readAll', () => {

            it('should read a directory, returning an object containing file contents.', async () => {
                // Build an FSConfigSource
                const fscs = new FSConfigSource(path.join(process.cwd(), TEST_DIR));

                // Read a file
                const result = await fscs.readAll();

                // Assertions
                expect(result['test.txt']).to.deep.equal(EXPECTED_TEST_TXT);
                expect(Object.keys(result).length).to.equal(1);
            });

            it('should recurse through directories, returning an object containing file contents.', async () => {
                // Build an FSConfigSource
                const fscs = new FSConfigSource(TEST_DIR, {relativeRootPath: true, recurse: true});

                // Read a file
                const result = await fscs.readAll();

                // Assertions
                expect(result['test.txt']).to.deep.equal(EXPECTED_TEST_TXT);
                expect(result['subdirectory/secret.txt']).to.deep.equal(EXPECTED_SECRET_TXT);
                expect(Object.keys(result).length).to.equal(2);
            });

        });

        describe('#list', () => {

            it('should list directory contents, skipping subdirectories.', async () => {
                // Build an FSConfigSource
                const fscs = new FSConfigSource(path.join(process.cwd(), TEST_DIR));

                // Read a file
                const result = await fscs.list();

                // Assertions
                expect(result).to.contain('test.txt');
                expect(result.length).to.equal(1);
            });

            it('should list directory contents recursively.', async () => {
                // Build an FSConfigSource
                const fscs = new FSConfigSource(TEST_DIR, {relativeRootPath: true, recurse: true});

                // Read a file
                const result = await fscs.list();

                // Assertions
                expect(result).to.contain('test.txt');
                expect(result).to.contain('subdirectory/secret.txt');
                expect(result.length).to.equal(2);
            });

        });

        describe('#readSync', () => {

            it('should read a file, returning its contents as a buffer.', () => {
                // Build an FSConfigSource
                const fscs = new FSConfigSource(TEST_DIR, {relativeRootPath: true});

                // Read a file
                const result = fscs.readSync('test.txt');

                // Assertions
                expect(result).to.deep.equal(EXPECTED_TEST_TXT);
            });

        });

        describe('#readAll', () => {

            it('should read a directory, returning an object containing file contents.', () => {
                // Build an FSConfigSource
                const fscs = new FSConfigSource(path.join(process.cwd(), TEST_DIR));

                // Read a file
                const result = fscs.readAllSync();

                // Assertions
                expect(result['test.txt']).to.deep.equal(EXPECTED_TEST_TXT);
                expect(Object.keys(result).length).to.equal(1);
            });

            it('should recurse through directories, returning an object containing file contents.', () => {
                // Build an FSConfigSource
                const fscs = new FSConfigSource(TEST_DIR, {relativeRootPath: true, recurse: true});

                // Read a file
                const result = fscs.readAllSync();

                // Assertions
                expect(result['test.txt']).to.deep.equal(EXPECTED_TEST_TXT);
                expect(result['subdirectory/secret.txt']).to.deep.equal(EXPECTED_SECRET_TXT);
                expect(Object.keys(result).length).to.equal(2);
            });

        });

        describe('#listSync', () => {

            it('should list directory contents, skipping subdirectories.', () => {
                // Build an FSConfigSource
                const fscs = new FSConfigSource(path.join(process.cwd(), TEST_DIR));

                // Read a file
                const result = fscs.listSync();

                // Assertions
                expect(result).to.contain('test.txt');
                expect(result.length).to.equal(1);
            });

            it('should list directory contents recursively.', () => {
                // Build an FSConfigSource
                const fscs = new FSConfigSource(TEST_DIR, {relativeRootPath: true, recurse: true});

                // Read a file
                const result = fscs.listSync();

                // Assertions
                expect(result).to.contain('test.txt');
                expect(result).to.contain('subdirectory/secret.txt');
                expect(result.length).to.equal(2);
            });

        });

    });

    describe ('- Negative', () => {

        it('should fail to build if rootPath does not exist.', async () => {
            try {
                // If this exists on any test environment, I'm scared.
                new FSConfigSource('/a/b/1001/1002/foo/bar/baz');
            }
            catch(err: any) {
                expect(err.message).to.contain('ENOENT');
                return;
            }
            throw new Error('No error was thrown.');
        });

        it('should fail to build if rootPath is not a directory.', async () => {
            try {
                new FSConfigSource(path.join(process.cwd(), 'package.json'));
            }
            catch(err: any) {
                expect(err.message).to.contain('ENOTDIR');
                return;
            }
            throw new Error('No error was thrown.');
        });

        describe('#read', () => {

            it('should read a file, returning undefined on an error.', async () => {
                // Build an FSConfigSource
                const fscs = new FSConfigSource(path.join(process.cwd(), TEST_DIR));

                // Read a file
                const result = await fscs.read('nope.txt');

                // Assertions
                expect(result).to.equal(undefined);
            });

            it('should read a file, throwing errors if throwErrors is set.', async () => {
                // Build an FSConfigSource
                const fscs = new FSConfigSource(TEST_DIR, {relativeRootPath: true, throwErrors: true});

                // Read a file
                try {
                    await fscs.read('nope.txt');
                }
                catch(err: any) {
                    expect(err.message).to.contain('ENOENT');
                    return;
                }
                throw new Error('No error was thrown.');
            });

        });

        describe('#readSync', () => {

            it('should read a file, returning undefined on an error.', () => {
                // Build an FSConfigSource
                const fscs = new FSConfigSource(path.join(process.cwd(), TEST_DIR));

                // Read a file
                const result = fscs.readSync('nope.txt');

                // Assertions
                expect(result).to.equal(undefined);
            });

            it('should read a file, throwing errors if throwErrors is set.', () => {
                // Build an FSConfigSource
                const fscs = new FSConfigSource(TEST_DIR, {relativeRootPath: true, throwErrors: true});

                // Read a file
                try {
                    fscs.readSync('nope.txt');
                }
                catch(err: any) {
                    expect(err.message).to.contain('ENOENT');
                    return;
                }
                throw new Error('No error was thrown.');
            });

        });

    });

});