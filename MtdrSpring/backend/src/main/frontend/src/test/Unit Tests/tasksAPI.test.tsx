import { describe, it, expect, vi, beforeEach } from "vitest";
import { tasksAPI } from "../../API";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("Unit: tasksAPI (fetch layer)", () => {
  it("Req 4: mark as completed -> PATCH /tasks/:id/status con {status:'DONE'}", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ taskId: 123, status: "DONE" }), {
        status: 200,
      }),
    );

    await tasksAPI.updateStatus(123, "DONE");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];

    expect(String(url)).toContain("/tasks/123/status");
    expect(init?.method).toBe("PATCH");
    expect(init?.headers).toEqual({ "Content-Type": "application/json" });
    expect(init?.body).toBe(JSON.stringify({ status: "DONE" })); // API.ts [11]
  });

  it("Req 2: state changes -> PUT /tasks/:id con payload (title/estimated/actual)", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ taskId: 1 }), { status: 200 }),
      );

    await tasksAPI.update(1, {
      title: "Nuevo titulo",
      estimatedHours: 13,
      actualHours: 8,
    } as any);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];

    expect(String(url)).toContain("/tasks/1");
    expect(init?.method).toBe("PUT");
    expect(init?.headers).toEqual({ "Content-Type": "application/json" });
    expect(init?.body).toBe(
      JSON.stringify({
        title: "Nuevo titulo",
        estimatedHours: 13,
        actualHours: 8,
      }),
    );
  });
});
