export class UniqueBucketMap<T = string> {
  private map = new Map<string, Set<T>>();
  add(key: string, value: T) {
    this.bucketFor(key).add(value);
  }

  get(key: string) {
    const bucket = this.map.get(key);
    return bucket ? Array.from(bucket.values()) : [];
  }

  delete(key: string): T[] {
    const bucket = this.bucketFor(key);
    this.map.delete(key);
    return bucket ? Array.from(bucket.values()) : [];
  }

  keys() {
    return this.map.keys();
  }

  values() {
    return this.map.values();
  }

  entries() {
    return this.map.entries();
  }

  toMap() {
    return new Map(Array.from(this.map.entries(), ([key, set]) => [key, Array.from(set)]));
  }

  private bucketFor(key: string) {
    let bucket = this.map.get(key);
    if (bucket != null) return bucket;
    bucket = new Set<T>();
    this.map.set(key, bucket);
    return bucket;
  }
}
