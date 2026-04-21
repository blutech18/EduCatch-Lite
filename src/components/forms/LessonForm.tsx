"use client";

import { useState, FormEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";

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

interface LessonFormProps {
  onSuccess?: () => void;
}

export default function LessonForm({ onSuccess }: LessonFormProps) {
  const user = useAuthStore((s) => s.user);
  const sessionToken = useAuthStore((s) => s.sessionToken);
  const addLesson = useMutation(api.lessons.addLesson);

  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    lessonDate: "",
    difficulty: "",
    estimatedMinutes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate() || !user) return;

    setIsSubmitting(true);
    try {
      await addLesson({
        userId: user._id,
        title: formData.title.trim(),
        subject: formData.subject,
        lessonDate: formData.lessonDate,
        difficulty: formData.difficulty as "easy" | "medium" | "hard",
        estimatedMinutes: Number(formData.estimatedMinutes),
        sessionToken: sessionToken ?? undefined,
      });
      setFormData({
        title: "",
        subject: "",
        lessonDate: "",
        difficulty: "",
        estimatedMinutes: "",
      });
      setErrors({});
      onSuccess?.();
    } catch (error) {
      console.error("Failed to add lesson:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
          options={subjectOptions}
          value={formData.subject}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, subject: e.target.value }))
          }
          error={errors.subject}
        />
        <Select
          label="Difficulty"
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

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Add Missed Lesson
      </Button>
    </form>
  );
}
