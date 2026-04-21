"use client";

import { useState, useMemo, FormEvent } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { parseConvexError } from "@/lib/errors";

const difficultyOptions = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const subjectOptions = [
  { value: "Mathematics", label: "Mathematics" },
  { value: "Science", label: "Science" },
  { value: "English", label: "English" },
  { value: "History", label: "History" },
  { value: "Geography", label: "Geography" },
  { value: "Physics", label: "Physics" },
  { value: "Chemistry", label: "Chemistry" },
  { value: "Biology", label: "Biology" },
  { value: "Computer Science", label: "Computer Science" },
  { value: "Other", label: "Other" },
];

interface TeacherLessonFormProps {
  onSuccess?: () => void;
}

export default function TeacherLessonForm({ onSuccess }: TeacherLessonFormProps) {
  const sessionToken = useAuthStore((s) => s.sessionToken);
  const addLesson = useMutation(api.lessons.addLesson);
  const students = useQuery(api.teachers.getAllStudents, sessionToken ? { sessionToken } : "skip");

  const [formData, setFormData] = useState({
    studentId: "",
    title: "",
    subject: "",
    lessonDate: "",
    difficulty: "",
    estimatedMinutes: "",
    content: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const studentOptions = useMemo(() => [
    ...(students && students.length > 1 ? [{ value: "__all__", label: "All Students" }] : []),
    ...(students ?? []).map((s) => ({
      value: s._id,
      label: `${s.name} (${s.email})`,
    })),
  ], [students]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.studentId) newErrors.studentId = "Please select a student";
    if (!formData.title.trim()) newErrors.title = "Lesson title is required";
    if (!formData.subject) newErrors.subject = "Subject is required";
    if (!formData.lessonDate) newErrors.lessonDate = "Date is required";
    if (!formData.difficulty) newErrors.difficulty = "Difficulty is required";
    if (
      !formData.estimatedMinutes ||
      Number(formData.estimatedMinutes) <= 0
    ) {
      newErrors.estimatedMinutes = "Enter a valid duration";
    }
    if (!formData.content.trim()) {
      newErrors.content = "Please write the lesson content for your students";
    } else if (formData.content.trim().length < 20) {
      newErrors.content =
        "Lesson content should be at least 20 characters so students have enough to read";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const isBulk = formData.studentId === "__all__";
      const targets = isBulk
        ? (students ?? []).map((s) => s._id)
        : [formData.studentId as Id<"users">];

      // When assigning the same lesson to multiple students, share a groupId
      // so the teacher overview shows a single consolidated row.
      const groupId =
        isBulk && targets.length > 1
          ? (globalThis.crypto?.randomUUID?.() ??
              `grp_${Date.now()}_${Math.random().toString(36).slice(2)}`)
          : undefined;

      await Promise.all(
        targets.map((uid) =>
          addLesson({
            userId: uid,
            title: formData.title.trim(),
            subject: formData.subject,
            lessonDate: formData.lessonDate,
            difficulty: formData.difficulty as "easy" | "medium" | "hard",
            estimatedMinutes: Number(formData.estimatedMinutes),
            content: formData.content.trim(),
            groupId,
            sessionToken: sessionToken ?? undefined,
          })
        )
      );
      setFormData({
        studentId: "",
        title: "",
        subject: "",
        lessonDate: "",
        difficulty: "",
        estimatedMinutes: "",
        content: "",
      });
      setErrors({});
      onSuccess?.();
    } catch (error) {
      setFormError(parseConvexError(error, "Failed to add lesson. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {formError && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {formError}
        </div>
      )}
      <Select
        label="Student"
        placeholder="Select a student"
        options={studentOptions}
        value={formData.studentId}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, studentId: e.target.value }))
        }
        error={errors.studentId}
      />

      <Input
        label="Lesson Title"
        placeholder="e.g. Chapter 5 - Quadratic Equations"
        value={formData.title}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, title: e.target.value }))
        }
        error={errors.title}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="Subject"
          placeholder="Select a subject"
          options={subjectOptions}
          value={formData.subject}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, subject: e.target.value }))
          }
          error={errors.subject}
        />
        <Select
          label="Difficulty"
          placeholder="Select difficulty"
          options={difficultyOptions}
          value={formData.difficulty}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, difficulty: e.target.value }))
          }
          error={errors.difficulty}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Lesson Date"
          type="date"
          value={formData.lessonDate}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, lessonDate: e.target.value }))
          }
          error={errors.lessonDate}
        />
        <Input
          label="Estimated Minutes"
          type="number"
          placeholder="e.g. 45"
          min="1"
          value={formData.estimatedMinutes}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              estimatedMinutes: e.target.value,
            }))
          }
          error={errors.estimatedMinutes}
        />
      </div>

      <Textarea
        label="Lesson Content"
        rows={10}
        placeholder={
          "Write the full lesson here so your student can read and study from it.\n\n" +
          "Example — Subtraction:\n" +
          "Subtraction is the process of taking one number away from another. " +
          "When we subtract, we find the difference between two numbers.\n\n" +
          "Example: 10 − 4 = 6\n\n" +
          "Tips:\n" +
          "• Always start with the bigger number.\n" +
          "• The minus sign (−) means 'take away'.\n" +
          "• Practice with small numbers first, then move to bigger ones."
        }
        value={formData.content}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, content: e.target.value }))
        }
        error={errors.content}
        hint="This is what the student will read on their lessons page."
      />

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        {formData.studentId === "__all__"
          ? `Add Lesson for All Students (${students?.length ?? 0})`
          : "Add Lesson for Student"}
      </Button>
    </form>
  );
}
