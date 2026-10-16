import { useState } from "react";
import { Clock, Pencil, UtensilsCrossed } from "lucide-react";
import { Page, PageHeader } from "../../components/layout/index.js";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Dialog,
  Field,
  Textarea,
  useToast,
} from "../../components/ui/index.js";
import { useView } from "../../state/demo.jsx";
import { useHaven } from "../../store/havenStore.jsx";
import { actions } from "../../store/reducer.js";
import { MEAL_LABELS, MEAL_ORDER, MEAL_TIMES } from "../../data/seed.js";
import { validateMeal } from "../../lib/validate.js";
import { getCurrentMealKey, getTodayName } from "../../data/selectors.js";

function MealEditDialog({ day, mealKey, current, onClose }) {
  const { dispatch } = useHaven();
  const pushToast = useToast();
  const [text, setText] = useState(current);
  const [error, setError] = useState(undefined);

  const handleSave = (e) => {
    e.preventDefault();
    const errs = validateMeal({ text });
    setError(errs.text);
    if (errs.text) return;
    dispatch(actions.updateMeal(day, mealKey, text));
    pushToast("success", "Mess menu updated", `${day}'s ${MEAL_LABELS[mealKey].toLowerCase()} menu has been updated.`);
    onClose();
  };

  return (
    <Dialog open={!!mealKey} onClose={onClose} title={`Edit ${day} ${MEAL_LABELS[mealKey]}`} description={`Timings: ${MEAL_TIMES[mealKey]}`}>
      <form onSubmit={handleSave} noValidate className="space-y-4">
        <Field label="Meal Items & Description" required error={error}>
          <Textarea
            value={text}
            onChange={(e) => { setText(e.target.value); setError(undefined); }}
            rows={3}
            aria-invalid={!!error}
            placeholder="List menu items separated by commas..."
          />
        </Field>
        <div className="flex justify-end gap-2.5 pt-2 border-t border-[#E8EDF0]">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save Menu</Button>
        </div>
      </form>
    </Dialog>
  );
}

export function Mess() {
  const { role } = useView();
  const { state } = useHaven();
  const [editing, setEditing] = useState(null); // {day, mealKey} | null
  const today = getTodayName();
  const currentMeal = getCurrentMealKey();
  const days = Object.keys(state.messMenu);
  const isAdmin = role === "admin";

  return (
    <Page>
      <PageHeader
        eyebrow={isAdmin ? "Administration" : "Resident Portal"}
        title="Weekly Mess Menu"
        description={
          isAdmin
            ? "Official weekly dining schedule. Click any meal item to edit the menu."
            : "Weekly dining schedule. Today's meals and active servings are highlighted."
        }
      />

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3 mb-6">
        {days.map((day) => {
          const isToday = day === today;
          return (
            <Card
              key={day}
              hoverable
              className={isToday ? "border-[#087CC9] ring-2 ring-[#087CC9]/20 shadow-md" : undefined}
            >
              <CardHeader
                title={day}
                subtitle={isToday ? "Today's Schedule" : "Daily Schedule"}
                action={isToday ? <Badge tone="pine" dot>Today</Badge> : undefined}
              />
              <CardBody className="space-y-3 pt-3">
                {MEAL_ORDER.map((mealKey) => {
                  const isNow = isToday && mealKey === currentMeal;
                  return (
                    <div
                      key={mealKey}
                      className={`group flex items-start justify-between gap-3 rounded-xl border p-3 transition-all duration-150 ${
                        isNow
                          ? "border-[#16865A]/30 bg-[#E2F6ED]/45 shadow-xs"
                          : "border-[#E8EDF0] bg-[#F3FAFC] hover:border-[#087CC9]/30 hover:bg-white"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#696B70]">
                            {MEAL_LABELS[mealKey]}
                          </span>
                          {isNow && <Badge tone="ok" dot size="sm">Serving Now</Badge>}
                        </div>
                        <p className="mt-1 text-sm font-semibold leading-snug text-[#17191D]">
                          {state.messMenu[day][mealKey]}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-[11px] text-[#696B70]">
                          <Clock className="size-3 text-[#696B70]" aria-hidden="true" />
                          {MEAL_TIMES[mealKey]}
                        </p>
                      </div>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => setEditing({ day, mealKey })}
                          aria-label={`Edit ${day} ${MEAL_LABELS[mealKey]}`}
                          className="shrink-0 rounded-lg p-2 text-[#696B70] transition-colors hover:bg-white hover:text-[#087CC9] cursor-pointer"
                        >
                          <Pencil className="size-3.5" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Info card */}
      <Card className="border-[#087CC9]/20 bg-[#E6F3FC]/50">
        <CardBody className="flex items-start gap-4">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#087CC9] text-white shadow-xs" aria-hidden="true">
            <UtensilsCrossed className="size-5" />
          </span>
          <div className="text-xs text-[#52555B] leading-relaxed">
            <p className="font-bold text-[#17191D] text-sm mb-0.5">Dining Hall Information & Special Dietary Requests</p>
            <p>
              Vegetarian and special dietary preparations (including Jain meals) are available daily upon request at Counter 1.
              For menu feedback or dietary suggestions, please file a ticket under the Mess category in the Complaints module.
            </p>
          </div>
        </CardBody>
      </Card>

      {editing && (
        <MealEditDialog
          day={editing.day}
          mealKey={editing.mealKey}
          current={state.messMenu[editing.day][editing.mealKey]}
          onClose={() => setEditing(null)}
        />
      )}
    </Page>
  );
}
