//

/**
 * @type {TransformStream<I,O>}
 */
export class TransformStream {
    /**
     * @param  {ReadableStream} rs
     * @return {TransformStream}
     */
    static start(rs) {
        const pipe = new TransformStream();
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
     * @param  {TransformStream} ts
     * @return {TransformStream}
     */
    pipe(ts) {
        this._pipe_next = ts;
        return ts;
    }
}
