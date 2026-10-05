import "./dom";
import { afterEach, expect, test } from "bun:test";
import { act, cleanup, fireEvent, render } from "@testing-library/react";

afterEach(cleanup);
import { useState } from "react";
import { Pencil } from "lucide-react";
import {
  Button,
  Dialog,
  IconButton,
  Lozenge,
  Menu,
  MenuItem,
  Tabs,
  ToastHost,
  toast,
  triggerButton,
} from "../src/ui/index";
import { useConfirmDialog } from "../src/lib/confirm";
import { Avatar, hueOf, initials } from "../src/ui/Avatar";
import { Logo } from "../src/brand/Logo";

test("Button renders a type=button by default and disables while loading", () => {
  const r = render(
    <>
      <Button icon={Pencil}>Edit</Button>
      <Button loading>Save</Button>
      <IconButton icon={Pencil} label="Edit page" />
    </>,
  );
  const edit = r.getByRole("button", { name: "Edit" });
  expect(edit.getAttribute("type")).toBe("button");
  expect(edit.querySelector("svg")).not.toBeNull();
  const save = r.getByRole("button", { name: /Save/ });
  expect((save as HTMLButtonElement).disabled).toBe(true);
  expect(save.getAttribute("aria-busy")).toBe("true");
  const icon = r.getByRole("button", { name: "Edit page" });
  expect(icon.getAttribute("data-tooltip")).toBe("Edit page");
});

test("Menu opens from the trigger, moves focus with arrows and closes on select", () => {
  const picked: string[] = [];
  const r = render(
    <Menu label="Page actions" trigger={(p) => <button {...p}>More</button>}>
      <MenuItem onSelect={() => picked.push("move")}>Move</MenuItem>
      <MenuItem onSelect={() => picked.push("delete")} danger>
        Delete
      </MenuItem>
    </Menu>,
  );
  const trigger = r.getByRole("button", { name: "More" });
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  act(() => {
    fireEvent.click(trigger);
  });
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  const menu = r.getByRole("menu", { name: "Page actions" });
  const items = r.getAllByRole("menuitem");
  expect(document.activeElement).toBe(items[0]!);
  act(() => {
    fireEvent.keyDown(menu, { key: "ArrowDown" });
  });
  expect(document.activeElement).toBe(items[1]!);
  act(() => {
    fireEvent.keyDown(menu, { key: "ArrowDown" });
  });
  expect(document.activeElement).toBe(items[0]!);
  act(() => {
    fireEvent.keyDown(menu, { key: "End" });
  });
  expect(document.activeElement).toBe(items[1]!);
  act(() => {
    fireEvent.click(items[1]!);
  });
  expect(picked).toEqual(["delete"]);
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
});

test("Dialog reports Esc through onClose and submits through onSubmit", () => {
  let closed = 0;
  let submitted = 0;
  const r = render(
    <Dialog
      open
      onClose={() => closed++}
      title="Move page"
      onSubmit={() => submitted++}
      footer={<Button type="submit">Move</Button>}
    >
      <p>Pick a parent</p>
    </Dialog>,
  );
  const dialog = r.getByRole("dialog", { name: "Move page" });
  act(() => {
    fireEvent(dialog, new window.Event("cancel", { cancelable: true }));
  });
  expect(closed).toBe(1);
  act(() => {
    fireEvent.click(r.getByRole("button", { name: "Move" }));
  });
  expect(submitted).toBe(1);
  act(() => {
    fireEvent.click(r.getByRole("button", { name: "Close" }));
  });
  expect(closed).toBe(2);
});

test("Tabs are controlled and arrow keys move the selection", () => {
  function Host() {
    const [v, setV] = useState<"a" | "b" | "c">("a");
    return (
      <Tabs
        label="Dashboard"
        value={v}
        onChange={setV}
        tabs={[
          { key: "a", label: "Worked on" },
          { key: "b", label: "Visited", count: 3 },
          { key: "c", label: "Saved" },
        ]}
      >
        <span>panel {v}</span>
      </Tabs>
    );
  }
  const r = render(<Host />);
  const list = r.getByRole("tablist", { name: "Dashboard" });
  expect(r.getByRole("tab", { name: /Worked on/ }).getAttribute("aria-selected")).toBe("true");
  act(() => {
    fireEvent.keyDown(list, { key: "ArrowRight" });
  });
  expect(r.getByRole("tab", { name: /Visited/ }).getAttribute("aria-selected")).toBe("true");
  expect(r.getByRole("tabpanel").textContent).toBe("panel b");
  act(() => {
    fireEvent.keyDown(list, { key: "ArrowLeft" });
  });
  act(() => {
    fireEvent.keyDown(list, { key: "ArrowLeft" });
  });
  expect(r.getByRole("tabpanel").textContent).toBe("panel c");
});

test("toast shows and dismisses", async () => {
  const r = render(<ToastHost />);
  act(() => {
    toast.success("Page published", { duration: 0 });
  });
  expect(r.getByRole("status").textContent).toContain("Page published");
  act(() => {
    fireEvent.click(r.getByRole("button", { name: "Dismiss" }));
  });
  expect(r.queryByRole("status")).toBeNull();
});

test("Avatar initials and stable hues", () => {
  expect(initials("Achmad Fauzi Harismawan")).toBe("AH");
  expect(initials("admin")).toBe("A");
  expect(initials("  ")).toBe("?");
  expect(hueOf("admin")).toBe(hueOf("admin"));
  expect(hueOf("admin")).toBeLessThan(6);
  const r = render(<Avatar name="Dev User" id="dev" size={32} />);
  expect(r.container.textContent).toBe("DU");
});

test("Logo renders both products' marks and wordmarks", () => {
  const a = render(<Logo product="atlas" />);
  expect(a.container.querySelector("svg")).not.toBeNull();
  expect(a.container.textContent).toBe("Atlas");
  const l = render(<Logo product="loopline" />);
  expect(l.container.querySelectorAll("circle").length).toBe(2);
  expect(l.container.textContent).toBe("Loopline");
  const m = render(<Logo product="atlas" variant="mark" />);
  expect(m.container.textContent).toBe("");
});

test("Menu data form renders items, separators, sections and a header", () => {
  const picked: string[] = [];
  const r = render(
    <Menu
      label="Projects"
      header={<span>Recent</span>}
      items={[
        { label: "Alpha", onSelect: () => picked.push("a") },
        "separator",
        { label: "Docs", href: "/docs" },
        { label: "Danger", danger: true, disabled: true },
      ]}
      sections={[{ heading: "More", items: [{ label: "Beta", bold: true }] }]}
      trigger={(p) => triggerButton(p, "Projects")}
    />,
  );
  const trigger = r.getByRole("button", { name: "Projects" });
  act(() => {
    fireEvent.click(trigger);
  });
  expect(r.getByText("Recent")).toBeTruthy();
  expect(r.getAllByRole("menuitem").length).toBe(4);
  expect(r.getByRole("menuitem", { name: "Docs" }).getAttribute("href")).toBe("/docs");
  expect(r.getByRole("menuitem", { name: "Danger" }).hasAttribute("disabled")).toBe(true);
  expect(r.getByRole("group", { name: "More" })).toBeTruthy();
  expect(r.getAllByRole("separator").length).toBe(1);
  act(() => {
    fireEvent.click(r.getByRole("menuitem", { name: "Alpha" }));
  });
  expect(picked).toEqual(["a"]);
});

test("Lozenge maps Jira status categories to tones", () => {
  const r = render(
    <>
      <Lozenge category="new">Open</Lozenge>
      <Lozenge category="indeterminate">Doing</Lozenge>
      <Lozenge category="done">Done</Lozenge>
    </>,
  );
  expect(r.getByText("Open").getAttribute("data-tone")).toBe("default");
  expect(r.getByText("Doing").getAttribute("data-tone")).toBe("info");
  expect(r.getByText("Done").getAttribute("data-tone")).toBe("success");
});

test("useConfirmDialog runs the action on confirm and shows its error", async () => {
  let runs = 0;
  function Host() {
    const [node, confirm] = useConfirmDialog("Delete");
    return (
      <>
        <button
          type="button"
          onClick={() =>
            confirm("Delete it?", async () => {
              runs++;
              if (runs === 1) throw new Error("nope");
            })
          }
        >
          go
        </button>
        {node}
      </>
    );
  }
  const r = render(<Host />);
  act(() => {
    fireEvent.click(r.getByText("go"));
  });
  expect(r.getByRole("dialog", { name: "Delete?" })).toBeTruthy();
  await act(async () => {
    fireEvent.click(r.getByRole("button", { name: "Delete" }));
  });
  expect(runs).toBe(1);
  expect(r.getByRole("alert").textContent).toBe("nope");
  await act(async () => {
    fireEvent.click(r.getByRole("button", { name: "Delete" }));
  });
  expect(runs).toBe(2);
  expect(r.queryByRole("dialog", { name: "Delete?" })).toBeNull();
});
