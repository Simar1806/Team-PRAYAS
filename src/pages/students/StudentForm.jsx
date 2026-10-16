import { useState } from "react";
import { Button, Field, Select, TextInput } from "../../components/ui/index.js";
import { COURSES } from "../../data/seed.js";
import { validateStudent } from "../../lib/validate.js";

/**
 * Add / edit student form. Rendered inside a Dialog; calls onSubmit with the
 * cleaned field values when validation passes.
 */
export function StudentForm({ initial, submitLabel, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    course: initial?.course ?? COURSES[0],
    year: String(initial?.year ?? 1),
    phone: initial?.phone ?? "",
  });
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((errs) => ({ ...errs, [key]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validateStudent(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSubmit({
      name: form.name.trim(),
      course: form.course,
      year: Number(form.year),
      phone: form.phone.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Field label="Full name" required error={errors.name}>
        <TextInput
          value={form.name}
          onChange={set("name")}
          placeholder="e.g. Aarav Sharma"
          autoComplete="name"
          aria-invalid={!!errors.name}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Course" required error={errors.course}>
          <Select value={form.course} onChange={set("course")}>
            {COURSES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Year" required error={errors.year}>
          <Select value={form.year} onChange={set("year")} aria-invalid={!!errors.year}>
            {[1, 2, 3, 4, 5].map((y) => (
              <option key={y} value={y}>
                Year {y}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Phone" hint="Optional — used by the warden's office." error={errors.phone}>
        <TextInput
          value={form.phone}
          onChange={set("phone")}
          placeholder="+91 98110 22334"
          inputMode="tel"
          autoComplete="tel"
          aria-invalid={!!errors.phone}
        />
      </Field>
      <div className="flex justify-end gap-2.5 pt-1">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
