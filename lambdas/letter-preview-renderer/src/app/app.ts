export class App {
  async initialRender(): Promise<{ ok: true } | { ok: false }> {
    return { ok: true };
  }
}
