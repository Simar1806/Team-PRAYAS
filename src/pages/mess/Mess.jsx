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
        <div className="flex justify-end gap-2.5 pt-2 border-t border-[#E8E2D7]">
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
              className={isToday ? "border-[#3E5BA9]/50 ring-4 ring-[#3E5BA9]/[0.07]" : undefined}
            >
              <CardHeader
                title={day}
                subtitle={isToday ? "Today's Schedule" : "Daily Schedule"}
                action={isToday ? <Badge tone="pine" dot>Today</Badge> : undefined}
              />
              <CardBody className="divide-y divide-[#F0ECE4] pt-2 pb-3">
                {MEAL_ORDER.map((mealKey) => {
                  const isNow = isToday && mealKey === currentMeal;
                  return (
                    <div
                      key={mealKey}
                      className={`group relative flex items-start justify-between gap-3 py-3.5 ${
                        isNow ? "-mx-3 rounded-lg border-transparent bg-[#E5F2E9]/60 px-3" : ""
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-[12px] font-medium text-[#9A7B4F]">
                            {MEAL_LABELS[mealKey]}
                          </span>
                          <span className="flex items-center gap-1 text-[12px] text-[#A39D92]">
                            <Clock className="size-3" aria-hidden="true" />
                            {MEAL_TIMES[mealKey]}
                          </span>
                          {isNow && <Badge tone="ok" dot size="sm">Serving Now</Badge>}
                        </div>
                        <p className="mt-1 text-[15px] font-medium leading-snug text-[#24221F]">
                          {state.messMenu[day][mealKey]}
                        </p>
                      </div>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => setEditing({ day, mealKey })}
                          aria-label={`Edit ${day} ${MEAL_LABELS[mealKey]}`}
                          className="shrink-0 rounded-lg p-2 text-[#A39D92] transition-colors hover:bg-[#F0ECE4] hover:text-[#24221F] cursor-pointer"
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
      <Card className="border-[#E8E2D7] bg-[#FAF8F3] shadow-none">
        <CardBody className="flex items-start gap-4">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#FDF6E6] text-[#87600F]" aria-hidden="true">
            <UtensilsCrossed className="size-5" />
          </span>
          <div className="text-[13px] text-[#58534B] leading-relaxed">
            <p className="font-semibold text-[#24221F] text-sm mb-1">Dining Hall Information & Special Dietary Requests</p>
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
