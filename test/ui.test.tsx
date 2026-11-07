import "./dom";
import { afterEach, expect, test } from "bun:test";
import { act, cleanup, fireEvent, render } from "@testing-library/react";

afterEach(cleanup);
import { useState } from "react";
import { Pencil } from "lucide-react";
import {
  Banner,
  Button,
  ButtonLink,
  Checkbox,
  ChoiceGroup,
  Dialog,
  DialogFooter,
  IconButton,
  Lozenge,
  Menu,
  MenuItem,
  OptionCard,
  OptionGrid,
  Radio,
  Select,
  SidePanel,
  Slider,
  Tabs,
  Tag,
  TagList,
  ToastHost,
  dismissAllToasts,
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
  expect(initials("[RDL] Achmad Fauzi")).toBe("AF");
  expect(initials("admin")).toBe("A");
  expect(initials("  ")).toBe("?");
  expect(hueOf("admin")).toBe(hueOf("admin"));
  expect(hueOf("admin")).toBeLessThan(6);
  const r = render(<Avatar name="Dev User" id="dev" size={32} />);
  expect(r.container.textContent).toBe("DU");
  expect(r.getByRole("img", { name: "Dev User" })).toBeTruthy();
  const pic = render(<Avatar name="Pic" id="pic" src="/x.png" />);
  act(() => {
    fireEvent.error(pic.container.querySelector("img")!);
  });
  expect(pic.container.textContent).toBe("P"); // broken picture falls back to initials
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
  expect(r.queryAllByRole("menuitem", { hidden: true }).length).toBe(0); // the data form renders only while open
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

test("a labelled Button keeps its icon a step below an icon-only button's", () => {
  const r = render(
    <>
      <Button icon={Pencil}>Edit</Button>
      <Button icon={Pencil} size="sm">
        Edit small
      </Button>
      <IconButton icon={Pencil} label="Edit page" />
      <IconButton icon={Pencil} label="Edit small page" size="sm" />
    </>,
  );
  const width = (name: string) => r.getByRole("button", { name }).querySelector("svg")?.getAttribute("width");
  expect(width("Edit")).toBe("16");
  expect(width("Edit small")).toBe("14");
  expect(width("Edit page")).toBe("20");
  expect(width("Edit small page")).toBe("16");
});

test("Select draws its own chevron instead of the browser's", () => {
  const r = render(
    <Select label="Space">
      <option>One</option>
    </Select>,
  );
  const select = r.getByLabelText("Space");
  const chevron = select.parentElement?.querySelector("svg");
  expect(chevron?.getAttribute("aria-hidden")).toBe("true");
  expect(chevron?.getAttribute("width")).toBe("16");
});

test("an inline Menu closes on Esc without letting the keydown reach the popover around it", () => {
  const outer: string[] = [];
  const picked: string[] = [];
  const r = render(
    // The keydown listener stands in for the surrounding popover's own Esc handling.
    <div onKeyDown={(e) => outer.push(`${e.key}:${e.defaultPrevented}`)}>
      <Menu inline label="Colours" trigger={(p) => <button {...p}>Colour</button>}>
        <MenuItem onSelect={() => picked.push("red")}>Red</MenuItem>
      </Menu>
    </div>,
  );
  const trigger = r.getByRole("button", { name: "Colour" });
  act(() => {
    fireEvent.click(trigger);
  });
  expect(document.activeElement).toBe(r.getByRole("menuitem", { name: "Red" }));
  // Cancelled (fireEvent returns false): a cancelled Esc keydown is not a close request for the native popover
  // around the menu, so only the menu closes.
  let notCancelled = true;
  act(() => {
    notCancelled = fireEvent.keyDown(r.getByRole("menu", { name: "Colours" }), { key: "Escape" });
  });
  expect(notCancelled).toBe(false);
  expect(r.queryByRole("menu")).toBeNull();
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  expect(document.activeElement).toBe(trigger);
  expect(outer).toEqual([]);
  // Esc on the trigger of an open menu closes it the same way.
  act(() => {
    fireEvent.click(trigger);
  });
  act(() => {
    trigger.focus();
    notCancelled = fireEvent.keyDown(trigger, { key: "Escape" });
  });
  expect(notCancelled).toBe(false);
  expect(r.queryByRole("menu")).toBeNull();
  expect(outer).toEqual([]);
  // Selecting an item also hands focus back to the trigger, not to <body>.
  act(() => {
    fireEvent.click(trigger);
  });
  act(() => {
    fireEvent.click(r.getByRole("menuitem", { name: "Red" }));
  });
  expect(picked).toEqual(["red"]);
  expect(document.activeElement).toBe(trigger);
});

test("a form inside a Dialog's content does not submit the form the Dialog was opened in", () => {
  let outer = 0;
  let inner = 0;
  const r = render(
    <form
      onSubmit={(e) => {
        e.preventDefault();
        outer++;
      }}
    >
      <Dialog open onClose={() => {}} title="Insert Jira">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            inner++;
          }}
        >
          <button type="submit">Search</button>
        </form>
      </Dialog>
    </form>,
  );
  act(() => {
    fireEvent.click(r.getByRole("button", { name: "Search" }));
  });
  expect(inner).toBe(1);
  expect(outer).toBe(0);
});

test("a Dialog opened inside a form submits only itself and is not nested in that form", () => {
  let outer = 0;
  let inner = 0;
  const r = render(
    <form
      onSubmit={(e) => {
        e.preventDefault();
        outer++;
      }}
    >
      <Dialog
        open
        onClose={() => {}}
        title="Insert macro"
        onSubmit={() => inner++}
        footer={<Button type="submit">Insert</Button>}
      />
    </form>,
  );
  act(() => {
    fireEvent.click(r.getByRole("button", { name: "Insert" }));
  });
  expect(inner).toBe(1);
  expect(outer).toBe(0);
  expect(r.getByRole("dialog").parentElement).toBe(document.body);
  expect(r.container.querySelector("dialog")).toBeNull();
});

test("a Dialog unmounted while open hands focus back to its opener, as close() does", () => {
  const r = render(<button type="button">opener</button>);
  const opener = r.getByRole("button", { name: "opener" });
  opener.focus();
  r.rerender(
    <>
      <button type="button">opener</button>
      <Dialog open onClose={() => {}} title="Pick" />
    </>,
  );
  r.getByRole("button", { name: "Close" }).focus(); // the browser moves focus into the modal
  r.rerender(<button type="button">opener</button>);
  expect(document.activeElement).toBe(opener);
});

test("Checkbox hideLabel keeps the label for assistive technology only", () => {
  const r = render(<Checkbox label="Select row" hideLabel />);
  const box = r.getByLabelText("Select row") as HTMLInputElement;
  expect(box.type).toBe("checkbox");
  expect(r.getByText("Select row").closest(".sr-only")).toBeTruthy();
});

test("the tooltip host is a manual popover, shown again on each reveal so it sits above an open dialog", async () => {
  const r = render(
    <Dialog open title="Zoom" onClose={() => undefined}>
      <IconButton icon={Pencil} label="Edit diagram" />
      <IconButton icon={Pencil} label="Rename" />
    </Dialog>,
  );
  const control = r.getByRole("button", { name: "Edit diagram" });
  act(() => {
    control.focus(); // focus reveals at once (no hover delay)
  });
  const host = document.querySelector<HTMLElement>(".mandala-tooltip")!;
  expect(host.getAttribute("popover")).toBe("manual");
  expect(host.hasAttribute("data-visible")).toBe(true);
  expect(host.textContent).toBe("Edit diagram");
  // Hovering another control while the bubble is still up reveals it again without a hide in between: the host
  // must leave and re-enter the top layer (hide, then show) to land above anything opened since.
  const toggles: string[] = [];
  host.addEventListener("toggle", (e) => toggles.push((e as ToggleEvent).newState));
  await act(async () => {
    fireEvent.pointerOver(r.getByRole("button", { name: "Rename" }));
    await new Promise((done) => setTimeout(done, 450));
  });
  expect(host.textContent).toBe("Rename");
  expect(toggles).toEqual(["closed", "open"]);
  act(() => {
    fireEvent.pointerDown(document);
  });
  expect(host.hasAttribute("data-visible")).toBe(false);
});

test("the tooltip host comes back when something cleared <body> after it was first shown", () => {
  const first = render(<IconButton icon={Pencil} label="Edit diagram" />);
  act(() => {
    first.getByRole("button", { name: "Edit diagram" }).focus();
  });
  expect(document.querySelector(".mandala-tooltip")).not.toBeNull();
  first.unmount();
  document.body.innerHTML = ""; // as other suites reset the page
  const again = render(<IconButton icon={Pencil} label="Rename" />);
  act(() => {
    again.getByRole("button", { name: "Rename" }).focus();
  });
  const host = document.querySelector<HTMLElement>(".mandala-tooltip");
  expect(host?.textContent).toBe("Rename");
  expect(host?.hasAttribute("data-visible")).toBe(true);
});

test("DialogFooter renders its actions into the enclosing Dialog's footer", () => {
  const r = render(
    <Dialog open onClose={() => {}} title="Restore">
      <p>Pick a backup</p>
      <DialogFooter>
        <Button>Restore now</Button>
      </DialogFooter>
    </Dialog>,
  );
  const button = r.getByRole("button", { name: "Restore now" });
  expect(button.closest("footer")).toBeTruthy();
  expect(r.getByText("Pick a backup").closest("footer")).toBeNull();
});

test("vertical Tabs draw a heading above the first tab of each group", () => {
  const r = render(
    <Tabs
      vertical
      label="Settings"
      value="general"
      onChange={() => {}}
      tabs={[
        { key: "general", label: "General", group: "Configuration" },
        { key: "mail", label: "Mail", group: "Configuration" },
        { key: "users", label: "Users", group: "People" },
      ]}
    >
      <p>panel</p>
    </Tabs>,
  );
  expect(r.getAllByText("Configuration").length).toBe(1);
  expect(r.getAllByText("People").length).toBe(1);
  expect(r.getAllByRole("tab").length).toBe(3);
});

test("Slider reports numbers and carries its spoken value", () => {
  const values: number[] = [];
  const r = render(
    <Slider label="Zoom" value={100} min={50} max={200} step={10} onChange={(v) => values.push(v)} valueText="100%" />,
  );
  const range = r.getByLabelText("Zoom") as HTMLInputElement;
  expect(range.type).toBe("range");
  expect(range.getAttribute("aria-valuetext")).toBe("100%");
  act(() => {
    fireEvent.change(range, { target: { value: "150" } });
  });
  expect(values).toEqual([150]);
});

test("Tag names its remove button and TagList groups the tags", () => {
  let removed = 0;
  const r = render(
    <TagList label="Labels">
      <Tag>docs</Tag>
      <Tag onRemove={() => removed++} removeLabel="Remove label release">
        release
      </Tag>
    </TagList>,
  );
  expect(r.getByRole("group", { name: "Labels" })).toBeTruthy();
  expect(r.getAllByRole("button").length).toBe(1);
  act(() => {
    fireEvent.click(r.getByRole("button", { name: "Remove label release" }));
  });
  expect(removed).toBe(1);
});

test("OptionCard is a toggle when selection is given and confirms on double-click", () => {
  const events: string[] = [];
  const r = render(
    <OptionGrid label="Content types">
      <OptionCard
        icon={Pencil}
        title="Page"
        description="A blank page"
        selected
        onSelect={() => events.push("select")}
        onConfirm={() => events.push("confirm")}
      />
      <OptionCard title="Blog post" onSelect={() => events.push("other")} />
    </OptionGrid>,
  );
  expect(r.getByRole("group", { name: "Content types" })).toBeTruthy();
  const page = r.getByRole("button", { name: /Page/ });
  expect(page.getAttribute("aria-pressed")).toBe("true");
  expect(r.getByRole("button", { name: "Blog post" }).hasAttribute("aria-pressed")).toBe(false);
  act(() => {
    fireEvent.click(page);
    fireEvent.doubleClick(page);
  });
  expect(events).toEqual(["select", "confirm"]);
});

test("Banner is a status notice with its action", () => {
  const r = render(
    <Banner icon={Pencil} tone="info" action={<Button>Retry</Button>}>
      Read-only mode
    </Banner>,
  );
  const banner = r.getByRole("status");
  expect(banner.getAttribute("data-tone")).toBe("info");
  expect(banner.textContent).toContain("Read-only mode");
  expect(r.getByRole("button", { name: "Retry" })).toBeTruthy();
});

test("SidePanel renders into the shell's #rail-slot, and nothing without one", () => {
  let closed = 0;
  const panel = (
    <SidePanel label="Page details" title="Details" closeLabel="Close details" onClose={() => closed++}>
      <p>body</p>
    </SidePanel>
  );
  const bare = render(panel);
  expect(bare.queryByRole("complementary")).toBeNull();
  bare.unmount();
  const slot = document.createElement("div");
  slot.id = "rail-slot";
  document.body.append(slot);
  const r = render(panel);
  const aside = r.getByRole("complementary", { name: "Page details" });
  expect(aside.parentElement).toBe(slot);
  act(() => {
    fireEvent.click(r.getByRole("button", { name: "Close details" }));
  });
  expect(closed).toBe(1);
  slot.remove();
});

test("dismissAllToasts clears every toast at once", () => {
  const r = render(<ToastHost />);
  act(() => {
    toast.success("Saved");
    toast.error("Failed");
  });
  expect(r.getByText("Saved")).toBeTruthy();
  act(() => {
    dismissAllToasts();
  });
  expect(r.queryByText("Saved")).toBeNull();
  expect(r.queryByText("Failed")).toBeNull();
});

test("a Menu item's own dialog outlives the menu closing", () => {
  function DeleteItem() {
    const [confirm, setConfirm] = useState(false);
    return (
      <>
        <MenuItem danger onSelect={() => setConfirm(true)}>
          Delete
        </MenuItem>
        <Dialog open={confirm} onClose={() => setConfirm(false)} title="Delete file?" />
      </>
    );
  }
  const r = render(
    <Menu label="File actions" trigger={(p) => <button {...p}>Actions</button>}>
      <DeleteItem />
    </Menu>,
  );
  act(() => {
    fireEvent.click(r.getByRole("button", { name: "Actions" }));
  });
  act(() => {
    fireEvent.click(r.getByRole("menuitem", { name: "Delete" }));
  });
  expect(r.getByRole("button", { name: "Actions" }).getAttribute("aria-expanded")).toBe("false");
  expect(r.getByRole("dialog", { name: "Delete file?" })).toBeTruthy();
});

test("ButtonLink is one link drawn as a button; disabled it has no href and swallows the click", () => {
  let clicks = 0;
  const r = render(
    <>
      <ButtonLink href="/download/a.csv" icon={Pencil} variant="primary">
        Export
      </ButtonLink>
      <ButtonLink href="/download/b.csv" disabled onClick={() => clicks++}>
        Later
      </ButtonLink>
    </>,
  );
  const live = r.getByRole("link", { name: "Export" });
  expect(live.getAttribute("href")).toBe("/download/a.csv");
  expect(live.getAttribute("data-variant")).toBe("primary");
  expect(live.querySelector("button")).toBeNull();
  const off = r.getByText("Later").closest("a")!;
  expect(off.hasAttribute("href")).toBe(false);
  expect(off.getAttribute("aria-disabled")).toBe("true");
  const click = new MouseEvent("click", { bubbles: true, cancelable: true });
  off.dispatchEvent(click);
  expect(click.defaultPrevented).toBe(true);
  expect(clicks).toBe(0);
});

test("ChoiceGroup: a legend over Radio options, disabled as a whole, nested groups marked, hidden legends kept", () => {
  function Group() {
    const [v, setV] = useState("a");
    return (
      <>
        <ChoiceGroup legend="Mode">
          <Radio label="A" name="mode" checked={v === "a"} onChange={() => setV("a")} />
          <Radio label="B" name="mode" description="The other one" checked={v === "b"} onChange={() => setV("b")} />
          <ChoiceGroup legend="Extras" nested hideLegend>
            <Checkbox label="More" />
          </ChoiceGroup>
        </ChoiceGroup>
        <ChoiceGroup legend="Locked" disabled>
          <Radio label="C" name="locked" />
        </ChoiceGroup>
      </>
    );
  }
  const r = render(<Group />);
  expect(r.getByRole("group", { name: "Mode" }).tagName).toBe("FIELDSET");
  const b = r.getByRole("radio", { name: /^B/ }) as HTMLInputElement;
  fireEvent.click(b);
  expect(b.checked).toBe(true);
  expect((r.getByRole("radio", { name: "A" }) as HTMLInputElement).checked).toBe(false);
  const extras = r.getByRole("group", { name: "Extras" });
  expect(extras.getAttribute("data-nested")).toBe("true");
  expect(extras.querySelector("legend")!.className).toBe("sr-only");
  expect((r.getByRole("group", { name: "Locked" }) as HTMLFieldSetElement).disabled).toBe(true);
  expect(r.getByRole("radio", { name: "C" }).matches(":disabled")).toBe(true);
});
