// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import PendingActionsTable from "../../components/tasks/PendingActionsTable";

describe("Component: PendingActionsTable", () => {
  it("snapshot: empty state", () => {
    const { container } = render(<PendingActionsTable rows={[]} />);
    expect(container).toMatchSnapshot();
  });

  it("render: muestra una fila", () => {
    const { getByText } = render(
      <PendingActionsTable
        rows={[
          {
            id: "Task-99",
            title: "Review PR",
            responsible: "Alice",
            message: "Pending Review",
            action: "Review Task",
          },
        ]}
      />,
    );

    expect(getByText("Task-99")).toBeInTheDocument();
    expect(getByText("Review PR")).toBeInTheDocument();
    expect(getByText("Pending Review")).toBeInTheDocument();
  });
});