export function* range(start, end) {
  for (
    let i = start < 0 ? 0 : start;
    i < end;
    i++) {
    yield i
  }
}