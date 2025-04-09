export default (value: string) => Number.MAX_SAFE_INTEGER > Number(value) ? value : Number.MAX_SAFE_INTEGER.toString();
