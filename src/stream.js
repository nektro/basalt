//

/**
 * @type {Transform<I,O>}
 */
export class Transform {
    /**
     * @param  {ReadableStream} rs
     * @return {Transform<I,O>}
     */
    static start(rs) {
        const pipe = new Transform();
        const reader = rs.getReader();

        reader.read().then(function handleRS({done,value}) {
            if (done) {
                return;
            }
            else {
                for (const b of value) {
                    pipe.read(b);
                }
                return reader.read().then(handleRS);
            }
        });

        return pipe;
    }
    constructor() {
        this._pipe_next = null;
    }
    /**
     * @param  {<I>} data
     */
    async read(data) {
        this.write(await data);
    }
    /**
     * @param  {<O>} data
     */
    async write(data) {
        if (this._pipe_next !== null) {
            this._pipe_next.read(data);
        }
    }
    /**
     * @param  {Transform<O,?>} ts
     * @return {Transform<O,?>}
     */
    pipe(ts) {
        this._pipe_next = ts;
        return ts;
    }
}
