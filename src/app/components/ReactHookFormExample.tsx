"use client";
import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import debounce from "lodash.debounce"; // Importing debounce
import clsx from "clsx"; // Import clsx

// Helper function to calculate age
const calculateAge = (birthdate: string): number => {
  const today = new Date();
  const birthDate = new Date(birthdate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

// Define Zod schema
const schema = z.object({
  name: z.string().nonempty("Name is required"), // Required string
  email: z.string().email("Invalid email format"), // Email validation
  date_of_birth: z
    .string()
    .refine((birthdate) => calculateAge(birthdate) >= 18, {
      message: "You must be at least 18 years old",
    }), // Required string
  age: z.number().positive("Age must be a positive number").int().optional(), // Optional positive integer
  gender: z.enum(["male", "female"]).optional(), // Optional enum
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }), // Checkbox validation for terms and conditions
  privacyPolicyAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the Privacy Policy",
  }), // Checkbox validation for terms and conditions
  privacySetting: z.enum(["public", "private", "protected"], {
    errorMap: () => ({ message: "Select a valid privacy option" }),
  }), // Radio buttons validation for privacy setup
});

// Define the shape of the form's data
// interface FormValues {
//   name: string;
//   email: string;
//   age?: number;
// }

// Infer the form data type from the schema
type FormValues = z.infer<typeof schema>;

const ReactHookFormExample = () => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema), // Use Zod resolver for validation
    defaultValues: {
      // Set "public" as the default value for privacySetting
      privacySetting: "public",
    },
  });
  const [emailTaken, setEmailTaken] = useState<boolean | null>(null);

  // This function will be debounced to avoid multiple API calls
  const checkEmailAvailability = debounce(async (email: string) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/check-email/?email=${email}`
      );
      setEmailTaken(!response.data.isAvailable); // Update the state based on response
    } catch (error) {
      console.error("Error checking email availability:", error);
    }
  }, 1000); // 1000ms delay (1 second)

  // Function called on email change to validate
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setValue("email", email); // Update form value
    checkEmailAvailability(email); // Trigger the debounced email check
  };

  // Function called on successful form submission
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      console.log("Form Data after submission:", data);
      const response = await axios.post(
        "http://127.0.0.1:8000/api/users/",
        data
      );
      console.log("Response:", response.data);
      reset(); // Reset the form after successful submission
    } catch (error) {
      console.log("Error submitting form:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name Field */}
      <div>
        <label>
          Name<span className="text-red-500">*</span>:
          <input
            {...register("name")}
            className="shadow-xl border p-2 rounded w-full h-12 bg-sky-100 focus:bg-sky-200 focus:border-green-500"
            placeholder="Enter your name"
          />
        </label>
        {errors.name && <p className="text-red-500">{errors.name.message}</p>}
      </div>

      {/* Email Field */}
      <div>
        <label>
          Email<span className="text-red-500">*</span>:
          <input
            {...register("email")}
            onChange={handleEmailChange}
            className="shadow-xl border p-2 rounded w-full h-12 bg-sky-100 focus:bg-sky-200"
            placeholder="Enter your email"
          />
        </label>
        {errors.email && <p className="text-red-500">{errors.email.message}</p>}
        {emailTaken !== null && (
          <p
            className={clsx({
              "text-red-500": emailTaken, // red text if email is taken
              "text-green-500": !emailTaken, // green text if email is available
            })}
          >
            {emailTaken ? "Email is already taken" : "Email is available"}
          </p>
        )}
      </div>

      {/* Age Field */}
      <div>
        <label>
          Date of Birth:
          <input
            type="date"
            placeholder="Select your Birthday"
            {...register("date_of_birth")}
            className="border shadow-xl p-2 rounded w-full h-12 bg-sky-100 focus:bg-sky-200"
          />
        </label>
        {errors.date_of_birth && (
          <p className="text-red-500">{errors.date_of_birth.message}</p>
        )}
      </div>

      {/* Age Field */}
      <div>
        <label>
          Age:
          <input
            type="number"
            placeholder="Enter your age"
            {...register("age", {
              valueAsNumber: true,
            })}
            className="border shadow-xl p-2 rounded w-full h-12 bg-sky-100 focus:bg-sky-200"
          />
        </label>
        {errors.age && <p className="text-red-500">{errors.age.message}</p>}
      </div>

      <div>
        <label>
          Gender:
          <select
            {...register("gender")}
            className="border shadow-xl
 p-2 rounded w-full h-12 bg-sky-100 focus:bg-sky-200"
          >
            <option value="">Select...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </label>
        {/* {errors.gender && (
          <p className="text-red-500">{errors.gender.message}</p>
        )} */}
      </div>

      {/* Terms and Conditions Checkbox */}
      <div>
        <label className="flex items-center  text-blue-600 bg-gray-100">
          <input
            type="checkbox"
            {...register("termsAccepted")}
            className="mr-2 w-6 h-6 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          I accept the terms and conditions
          <span className="text-red-500">*</span>
        </label>
        {errors.termsAccepted && (
          <p className="text-red-500">{errors.termsAccepted.message}</p>
        )}
      </div>

      {/* Privacy Policy Checkbox */}
      <div>
        <label className="flex items-center  text-blue-600 bg-gray-100">
          <input
            type="checkbox"
            {...register("privacyPolicyAccepted")}
            className="mr-2 w-6 h-6 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          I read and accept privcy policy<span className="text-red-500">*</span>
        </label>
        {errors.privacyPolicyAccepted && (
          <p className="text-red-500">{errors.privacyPolicyAccepted.message}</p>
        )}
      </div>

      {/* Privacy Setting Radio Buttons */}
      <div>
        <label className="block">Privacy Setting:</label>
        <div className="flex items-center space-x-4">
          <label>
            <input
              type="radio"
              value="public"
              {...register("privacySetting")}
              className="mr-2"
            />
            Public
          </label>
          <label>
            <input
              type="radio"
              value="private"
              {...register("privacySetting")}
              className="mr-2"
            />
            Private
          </label>
          <label>
            <input
              type="radio"
              value="protected"
              {...register("privacySetting")}
              className="mr-2"
            />
            Protected
          </label>
        </div>
        {errors.privacySetting && (
          <p className="text-red-500">{errors.privacySetting.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="bg-green-500 text-white px-4 py-2 rounded w-full"
      >
        Submit
      </button>
    </form>
  );
};

export default ReactHookFormExample;
