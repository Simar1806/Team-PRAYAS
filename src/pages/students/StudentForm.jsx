import { useState } from "react";
import { Button, Field, Select, TextInput, Textarea } from "../../components/ui/index.js";
import { BLOOD_GROUPS, COURSES } from "../../data/seed.js";
import { validateStudent } from "../../lib/validate.js";

function Section({ title, description, children }) {
  return (
    <fieldset className="space-y-4">
      <div>
        <legend className="font-display text-[15px] font-semibold text-[#24221F]">{title}</legend>
        {description && <p className="mt-0.5 text-[13px] text-[#6F6A62]">{description}</p>}
      </div>
      {children}
    </fieldset>
  );
}

/**
 * Student details form, grouped into sections. Used by administrators to edit
 * a record and by residents to complete their profile on first sign-in
 * (`lockName` keeps the administrator-issued name read-only).
 */
export function StudentForm({ initial, submitLabel, onSubmit, onCancel, lockName = false }) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    course: initial?.course ?? COURSES[0],
    year: String(initial?.year ?? 1),
    phone: initial?.phone ?? "",
    email: initial?.email ?? "",
    dob: initial?.dob ?? "",
    bloodGroup: initial?.bloodGroup ?? "",
    address: initial?.address ?? "",
    guardianName: initial?.guardianName ?? "",
    guardianPhone: initial?.guardianPhone ?? "",
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
      email: form.email.trim(),
      dob: form.dob,
      bloodGroup: form.bloodGroup,
      address: form.address.trim(),
      guardianName: form.guardianName.trim(),
      guardianPhone: form.guardianPhone.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-7">
      <Section title="Academic details">
        <Field label="Full name" required error={errors.name} hint={lockName ? "Set by the hostel office. Ask the warden to correct it." : undefined}>
          <TextInput
            value={form.name}
            onChange={set("name")}
            placeholder="e.g. Aarav Sharma"
            autoComplete="name"
            readOnly={lockName}
            disabled={lockName}
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
      </Section>

      <Section title="Contact">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone" required error={errors.phone}>
            <TextInput
              value={form.phone}
              onChange={set("phone")}
              placeholder="+91 98110 22334"
              inputMode="tel"
              autoComplete="tel"
              aria-invalid={!!errors.phone}
            />
          </Field>
          <Field label="Email" required error={errors.email}>
            <TextInput
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="name@college.edu.in"
              autoComplete="email"
              aria-invalid={!!errors.email}
            />
          </Field>
        </div>
      </Section>

      <Section title="Personal">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Date of birth" required error={errors.dob}>
            <TextInput type="date" value={form.dob} onChange={set("dob")} aria-invalid={!!errors.dob} />
          </Field>
          <Field label="Blood group" hint="Optional, for medical emergencies.">
            <Select value={form.bloodGroup} onChange={set("bloodGroup")}>
              <option value="">Not specified</option>
              {BLOOD_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Home address" required error={errors.address}>
          <Textarea
            rows={2}
            value={form.address}
            onChange={set("address")}
            placeholder="House, street, city, state"
            aria-invalid={!!errors.address}
          />
        </Field>
      </Section>

      <Section title="Parent or guardian" description="Who the hostel office should contact in an emergency.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Guardian name" required error={errors.guardianName}>
            <TextInput
              value={form.guardianName}
              onChange={set("guardianName")}
              placeholder="e.g. Rajesh Sharma"
              aria-invalid={!!errors.guardianName}
            />
          </Field>
          <Field label="Guardian phone" required error={errors.guardianPhone}>
            <TextInput
              value={form.guardianPhone}
              onChange={set("guardianPhone")}
              placeholder="+91 98110 22334"
              inputMode="tel"
              aria-invalid={!!errors.guardianPhone}
            />
          </Field>
        </div>
      </Section>

      <div className="flex justify-end gap-2.5 border-t border-[#E8E2D7] pt-5">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
