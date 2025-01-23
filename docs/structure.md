To improve structure, reusability, and maintainability, we can break the form, API calls, and Zod schema into multiple files with a modular approach. Here’s how to refactor the example into a better-organized structure:

---

### File Structure

```plaintext
/src
  /components
    /forms
      PrivacySettingsForm.tsx   # Form component
    FormField.tsx               # Generic form input components
  /hooks
    useAuth.ts                  # Hook for authentication
    useApi.ts                   # Hook for API calls
  /schemas
    formSchemas.ts              # Zod schemas
  /services
    apiService.ts               # API abstraction for backend communication
```

---

### **1. Breaking Down the Code**

#### **Zod Schema (Reusable)**: `/src/schemas/formSchemas.ts`

Move the Zod schemas to their own file so they can be reused by other components or forms.

```typescript
import { z } from "zod";

export const privacySettingsSchema = z.object({
  name: z.string().nonempty("Name is required"),
  email: z.string().email("Invalid email format"),
  birthDate: z.string().refine((date) => {
    const age = Math.abs(
      new Date().getFullYear() - new Date(date).getFullYear()
    );
    return age >= 18;
  }, "Age must be 18 or older"),
  privacy: z.enum(["public", "private", "protected"]).default("public"),
  termsAccepted: z.literal(true).refine((value) => value === true, {
    message: "You must accept the terms and conditions",
  }),
});

export type PrivacySettingsFormValues = z.infer<typeof privacySettingsSchema>;
```

---

#### **Authentication Hook**: `/src/hooks/useAuth.ts`

A reusable hook for authentication and authorization.

```typescript
import { useState } from "react";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (credentials: { username: string; password: string }) => {
    // Simulate login logic
    console.log("Logging in...", credentials);
    setIsAuthenticated(true);
  };

  const logout = () => {
    console.log("Logging out...");
    setIsAuthenticated(false);
  };

  return { isAuthenticated, login, logout };
};
```

---

#### **API Service**: `/src/services/apiService.ts`

Centralize all API calls for better reusability and to separate concerns.

```typescript
import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  timeout: 5000,
});

export const checkEmail = async (email: string) => {
  const response = await apiClient.get(`/check-email?email=${email}`);
  return response.data;
};

export const submitPrivacySettings = async (data: any) => {
  const response = await apiClient.post(`/users/`, data);
  return response.data;
};
```

---

#### **Form Component**: `/src/components/forms/PrivacySettingsForm.tsx`

The form itself, using React Hook Form and Zod for validation.

```typescript
"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  privacySettingsSchema,
  PrivacySettingsFormValues,
} from "@/schemas/formSchemas";
import { submitPrivacySettings, checkEmail } from "@/services/apiService";

const PrivacySettingsForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PrivacySettingsFormValues>({
    resolver: zodResolver(privacySettingsSchema),
    defaultValues: { privacy: "public" },
  });

  const onSubmit = async (data: PrivacySettingsFormValues) => {
    try {
      const response = await submitPrivacySettings(data);
      console.log("Form submitted successfully", response);
    } catch (error) {
      console.error("Submission failed", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name Field */}
      <div>
        <label>
          Name:
          <input {...register("name")} className="border p-2 rounded w-full" />
        </label>
        {errors.name && <p className="text-red-500">{errors.name.message}</p>}
      </div>

      {/* Email Field */}
      <div>
        <label>
          Email:
          <input {...register("email")} className="border p-2 rounded w-full" />
        </label>
        {errors.email && <p className="text-red-500">{errors.email.message}</p>}
      </div>

      {/* Birth Date */}
      <div>
        <label>
          Birth Date:
          <input
            type="date"
            {...register("birthDate")}
            className="border p-2 rounded w-full"
          />
        </label>
        {errors.birthDate && (
          <p className="text-red-500">{errors.birthDate.message}</p>
        )}
      </div>

      {/* Privacy Options */}
      <div>
        <label>
          Privacy:
          <select
            {...register("privacy")}
            className="border p-2 rounded w-full"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="protected">Protected</option>
          </select>
        </label>
        {errors.privacy && (
          <p className="text-red-500">{errors.privacy.message}</p>
        )}
      </div>

      {/* Terms and Conditions */}
      <div>
        <label>
          <input type="checkbox" {...register("termsAccepted")} />
          Accept Terms and Conditions
        </label>
        {errors.termsAccepted && (
          <p className="text-red-500">{errors.termsAccepted.message}</p>
        )}
      </div>

      <button
        type="submit"
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Submit
      </button>
    </form>
  );
};

export default PrivacySettingsForm;
```

---

### Benefits of Refactoring

1. **Reusable Zod Schema**:

   - `privacySettingsSchema` can now be imported into other forms or validation logic.

2. **Centralized API Calls**:

   - If the endpoint changes or more complex headers are needed, you only update `apiService.ts`.

3. **Authentication Hook**:

   - Adds flexibility for handling auth-related logic.

4. **Clean Component**:

   - The form component focuses only on rendering the form and handling submission.

5. **Easy Expansion**:
   - If additional features like role-based authorization are required, you can extend the `useAuth` hook or add a higher-order component.

---

### Adding Authentication and Authorization

1. **Authorization Middleware**:
   - Wrap your form component with an authentication check:

```tsx
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import PrivacySettingsForm from "@/components/forms/PrivacySettingsForm";

const AuthenticatedForm = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <p>You need to log in to access this form.</p>;
  }

  return <PrivacySettingsForm />;
};

export default AuthenticatedForm;
```

2. **Route Guards in Next.js**:
   - Use `getServerSideProps` to ensure only authenticated users can access the page:

```tsx
export async function getServerSideProps(context: any) {
  const { req } = context;
  const isAuthenticated = req.cookies.token; // Example auth logic

  if (!isAuthenticated) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return { props: {} };
}
```

---

This structure is modular, scalable, and adheres to separation of concerns, making the form easy to maintain and expand in the future.

Yes, authentication and API calls can (and often should) be handled on the server side in **Next.js** for better security, performance, and code organization. With the advent of **React Server Components** and **Server Actions** in Next.js, you can leverage these features for both authentication and API calls. Here's how and why:

---

### **Why Use Server Components or Server Actions for Authentication and API Calls?**

1. **Security**:

   - Sensitive logic, like validating user tokens or secrets, stays on the server and is not exposed to the client.

2. **Reduced Client Overhead**:

   - Offloading data fetching to the server reduces the need for managing complex state or hooks on the client.

3. **Simplified Data Management**:

   - Pre-render data on the server so it's ready for the client, minimizing unnecessary API calls.

4. **SEO-Friendly**:
   - Server-rendered data is immediately available to search engines.

---

### **Using Server Components**

Server Components are ideal for securely fetching and rendering data like authenticated user info or protected API responses.

#### Example: Authentication with Server Components

**File: `/app/protected/page.tsx`**

```tsx
import { cookies } from "next/headers"; // Access cookies on the server
import { fetchUserData } from "@/services/apiService";

const ProtectedPage = async () => {
  // Get the token from cookies
  const token = cookies().get("auth_token");

  if (!token) {
    return <p>You are not logged in. Please log in to access this page.</p>;
  }

  // Fetch user data on the server
  const userData = await fetchUserData(token.value);

  return (
    <div>
      <h1>Welcome, {userData.name}</h1>
      <p>Email: {userData.email}</p>
    </div>
  );
};

export default ProtectedPage;
```

**File: `/services/apiService.ts`**

```typescript
export const fetchUserData = async (token: string) => {
  const response = await fetch("http://127.0.0.1:8000/api/users/me/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user data");
  }

  return response.json();
};
```

---

### **Using Server Actions**

Server Actions allow you to directly handle form submissions or data mutations on the server without needing an API route.

#### Example: Form Submission with Server Actions

**File: `/app/forms/privacy-settings/page.tsx`**

```tsx
"use client";

import { useState, FormEvent } from "react";

export const submitPrivacySettings = async (formData: FormData) => {
  "use server"; // Enable server action
  const response = await fetch("http://127.0.0.1:8000/api/users/", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to submit form");
  }

  return response.json();
};

const PrivacySettingsForm = () => {
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    try {
      const result = await submitPrivacySettings(formData);
      setMessage("Form submitted successfully!");
    } catch (error) {
      setMessage("Submission failed. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Name: <input name="name" type="text" required />
        </label>
      </div>
      <div>
        <label>
          Email: <input name="email" type="email" required />
        </label>
      </div>
      <div>
        <label>
          Birth Date: <input name="birthDate" type="date" required />
        </label>
      </div>
      <div>
        <label>
          Privacy:
          <select name="privacy" defaultValue="public">
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="protected">Protected</option>
          </select>
        </label>
      </div>
      <div>
        <label>
          <input name="termsAccepted" type="checkbox" required /> Accept Terms
          and Conditions
        </label>
      </div>
      <button type="submit">Submit</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default PrivacySettingsForm;
```

---

### **When to Use Each Approach?**

| **Use Case**                  | **Server Components**                                           | **Server Actions**                                                    |
| ----------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------- |
| **Fetching Protected Data**   | Ideal for rendering user data or private content securely.      | Not applicable; use Server Components for data fetching.              |
| **Handling Form Submissions** | Use if data fetching happens after submission (not during SSR). | Best for directly handling form submissions without an API route.     |
| **Simple API Calls**          | Good for static or pre-rendered content.                        | Good for forms or operations that don’t need much client interaction. |
| **Complex Interactions**      | Offload complex logic to Server Components or API routes.       | Combine with Server Components if client interactions are involved.   |

---

### **Combining Both Approaches**

In real-world projects, you'll often combine **Server Components** for rendering data and **Server Actions** for handling mutations or form submissions. This approach ensures optimal security, performance, and user experience.

For example:

- Use **Server Components** to pre-render the form with any pre-filled data.
- Use **Server Actions** to handle form submissions directly on the server.

This modular approach makes your Next.js project scalable and easy to maintain.

To improve code structure and reusability, you can separate the **Server Action** logic from the form component file by placing it in its own file or module. Here's how you can refactor the code:

---

### **Folder Structure**

```plaintext
app/
  forms/
    privacy-settings/
      page.tsx         // React component for the form
  actions/
    submitForm.ts      // Server Action logic
```

---

### **Step-by-Step Implementation**

#### **1. Create the Server Action File**

**File: `/app/actions/submitForm.ts`**

```typescript
"use server"; // Indicates this file contains server action logic

export const submitPrivacySettings = async (formData: FormData) => {
  const response = await fetch("http://127.0.0.1:8000/api/users/", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to submit form");
  }

  return response.json();
};
```

By moving the server action to its own file, it becomes reusable across multiple components or forms.

---

#### **2. Import the Server Action in the Form Component**

**File: `/app/forms/privacy-settings/page.tsx`**

```tsx
"use client";

import { useState, FormEvent } from "react";
import { submitPrivacySettings } from "@/app/actions/submitForm"; // Import server action

const PrivacySettingsForm = () => {
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    try {
      const result = await submitPrivacySettings(formData); // Call the server action
      setMessage("Form submitted successfully!");
    } catch (error) {
      setMessage("Submission failed. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Name: <input name="name" type="text" required />
        </label>
      </div>
      <div>
        <label>
          Email: <input name="email" type="email" required />
        </label>
      </div>
      <div>
        <label>
          Birth Date: <input name="birthDate" type="date" required />
        </label>
      </div>
      <div>
        <label>
          Privacy:
          <select name="privacy" defaultValue="public">
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="protected">Protected</option>
          </select>
        </label>
      </div>
      <div>
        <label>
          <input name="termsAccepted" type="checkbox" required /> Accept Terms
          and Conditions
        </label>
      </div>
      <button type="submit">Submit</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default PrivacySettingsForm;
```

---

### **Benefits of Refactoring Server Actions**

1. **Separation of Concerns**:

   - The form logic (`page.tsx`) focuses on the UI and user interactions.
   - The server-side logic (`submitForm.ts`) is responsible for handling API calls.

2. **Reusability**:

   - The `submitPrivacySettings` function can now be reused by other forms or components without duplicating code.

3. **Maintainability**:
   - You can easily modify or update the API logic in a centralized location without touching the form components.

---

### **3. Optional Enhancements**

If you have multiple server actions, you can organize them under a namespace or folder:

**Folder Structure**

```plaintext
app/
  actions/
    forms/
      privacySettings.ts
    auth/
      login.ts
      register.ts
```

Each file can contain server actions related to specific features (e.g., forms, authentication). This approach further enhances the modularity of your project.

## Next Js Project structure and setup

https://github.com/Skolaczk/next-starter

https://github.com/xizon/fullstack-nextjs-app-template

https://dev.to/jancodes/how-to-set-up-nextjs-15-for-production-in-2024-393

https://github.com/emmanuelonah/nextjs-project-architecture-template

https://github.com/nhanluongoe/nextjs-boilerplate

git clone --depth=1 https://github.com/nhanluongoe/nextjs-boilerplate.git project-name
cd project-name
npm install
npm run dev

## Demo application

https://github.com/mertthesamael/lalasia

lalasia/
├── actions
├── app
├── components
├── containers
├── db
├── hooks
├── jest.config.js
├── libs
├── LICENSE
├── middleware.ts
├── next.config.js
├── package.json
├── pnpm-lock.yaml
├── postcss.config.js
├── prisma
├── public
├── README.md
├── store
├── styles
├── tailwind.config.ts
├── **tests**
├── tsconfig.json
└── types

lalasia/
├── actions
│   ├── auth.ts
│   ├── order.ts
│   └── search.ts
├── app
│   ├── about
│   │   └── page.tsx
│   ├── api
│   │   ├── products
│   │   │   ├── getAll
│   │   │   │   └── route.ts
│   │   │   ├── getSingle
│   │   │   │   └── route.ts
│   │   │   └── searchItem
│   │   │   └── route.ts
│   │   └── user
│   │   ├── basket
│   │   │   └── route.ts
│   │   └── orders
│   │   └── route.ts
│   ├── article
│   │   └── [id]
│   │   └── page.tsx
│   ├── articles
│   │   └── page.tsx
│   ├── auth
│   │   ├── callback
│   │   │   └── route.ts
│   │   ├── login
│   │   │   └── page.tsx
│   │   └── signup
│   │   └── page.tsx
│   ├── checkout
│   │   └── page.tsx
│   ├── error.tsx
│   ├── favicon.ico
│   ├── global-error.tsx
│   ├── globals.css
│   ├── icon.png
│   ├── layout.tsx
│   ├── not-found.tsx
│   ├── orders
│   │   └── page.tsx
│   ├── page.tsx
│   ├── product
│   │   ├── [id]
│   │   │   └── page.tsx
│   │   └── loading.tsx
│   ├── products
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── search
│   │   └── page.tsx
│   └── services
│   └── page.tsx
├── components
│   ├── Banners
│   │   └── ProductsBanner
│   │   └── index.tsx
│   ├── Brand
│   │   └── index.tsx
│   ├── Buttons
│   │   ├── FilterButton
│   │   │   └── index.tsx
│   │   ├── HamburgerButton
│   │   │   └── index.tsx
│   │   ├── PageButton
│   │   │   └── index.tsx
│   │   └── PrimaryButton
│   │   └── index.tsx
│   ├── Cards
│   │   ├── ArticleCard
│   │   │   └── index.tsx
│   │   ├── BasketCard
│   │   │   └── index.tsx
│   │   ├── OrderCard
│   │   │   └── index.tsx
│   │   ├── PeopleCard
│   │   │   └── index.tsx
│   │   ├── ProductCard
│   │   │   └── index.tsx
│   │   ├── ResponsiveCard
│   │   │   └── index.tsx
│   │   ├── ServiceCard
│   │   │   └── index.tsx
│   │   └── TestimonialCard
│   │   └── index.tsx
│   ├── DropDowns
│   │   ├── Filter
│   │   │   └── index.tsx
│   │   └── Sort
│   │   └── index.tsx
│   ├── Footer
│   │   ├── constants.ts
│   │   └── index.tsx
│   ├── Forms
│   │   ├── Inputs
│   │   │   └── Search
│   │   │   └── index.tsx
│   │   ├── LoginForm
│   │   │   └── index.tsx
│   │   └── SignupForm
│   │   └── index.tsx
│   ├── Header
│   │   ├── constants.ts
│   │   ├── index.tsx
│   │   └── user-actions
│   │   └── index.tsx
│   ├── Icons
│   │   ├── Basket.tsx
│   │   ├── Close.tsx
│   │   ├── Error.tsx
│   │   ├── Filter.tsx
│   │   ├── Google.tsx
│   │   ├── HamburgerIcon.tsx
│   │   ├── Logo.tsx
│   │   ├── Pause.tsx
│   │   ├── Play.tsx
│   │   ├── Profile.tsx
│   │   ├── Quote.tsx
│   │   ├── RateStar.tsx
│   │   ├── Search.tsx
│   │   ├── ServiceIcons.tsx
│   │   ├── Sketchs.tsx
│   │   ├── SlideArrow.tsx
│   │   └── Sort.tsx
│   ├── Loaders
│   │   └── Spinner
│   │   └── index.tsx
│   ├── MobileMenu
│   │   └── index.tsx
│   ├── Navs
│   │   └── HeaderNav
│   │   └── index.tsx
│   └── Pagination
│   └── index.tsx
├── containers
│   ├── about-page
│   │   ├── cta-section
│   │   │   └── index.tsx
│   │   ├── hero-section
│   │   │   ├── hero-player
│   │   │   │   └── index.tsx
│   │   │   └── index.tsx
│   │   ├── mission-section
│   │   │   ├── constants.ts
│   │   │   └── index.tsx
│   │   └── team-section
│   │   ├── constants.ts
│   │   └── index.tsx
│   ├── articles-page
│   │   ├── cta-section
│   │   │   └── index.tsx
│   │   ├── daily-section
│   │   │   ├── constants.ts
│   │   │   └── index.tsx
│   │   ├── hero-section
│   │   │   ├── articles-hero-slide
│   │   │   │   ├── index.tsx
│   │   │   │   ├── slide
│   │   │   │   │   └── index.tsx
│   │   │   │   └── style.module.scss
│   │   │   └── index.tsx
│   │   └── trending-section
│   │   ├── constants.ts
│   │   └── index.tsx
│   ├── auth-page
│   │   ├── login-page
│   │   │   └── form-section
│   │   │   └── index.tsx
│   │   └── signup-page
│   │   └── form-section
│   │   └── index.tsx
│   ├── checkout-page
│   │   ├── form-section
│   │   │   ├── index.tsx
│   │   │   └── items
│   │   │   └── index.tsx
│   │   └── success-section
│   │   └── index.tsx
│   ├── home-page
│   │   ├── articles-section
│   │   │   ├── articles-slide
│   │   │   │   ├── index.tsx
│   │   │   │   └── style.module.scss
│   │   │   ├── constants.ts
│   │   │   └── index.tsx
│   │   ├── cta-section
│   │   │   └── index.tsx
│   │   ├── hero-section
│   │   │   └── index.tsx
│   │   ├── info-section
│   │   │   └── index.tsx
│   │   ├── popular-products-section
│   │   │   ├── index.tsx
│   │   │   └── popular-products-slide
│   │   │   ├── index.tsx
│   │   │   └── style.module.scss
│   │   ├── services-section
│   │   │   ├── constants.ts
│   │   │   └── index.tsx
│   │   └── testimonial-section
│   │   ├── index.tsx
│   │   └── testimonial-slide
│   │   ├── index.tsx
│   │   └── style.module.scss
│   ├── orders-page
│   │   ├── orders-section
│   │   │   └── index.tsx
│   │   └── title-section
│   │   └── index.tsx
│   ├── product-page
│   │   ├── item-section
│   │   │   ├── constants.ts
│   │   │   └── index.tsx
│   │   └── related-section
│   │   └── index.tsx
│   ├── products-page
│   │   ├── items-section
│   │   │   └── index.tsx
│   │   ├── products-hero
│   │   │   ├── index.tsx
│   │   │   └── products-hero-slide
│   │   │   ├── index.tsx
│   │   │   └── style.scss
│   │   └── search-section
│   │   └── index.tsx
│   ├── search-page
│   │   ├── result-section
│   │   │   └── index.tsx
│   │   └── search-section
│   │   └── index.tsx
│   └── services-page
│   ├── cards-section
│   │   ├── constants.ts
│   │   └── index.tsx
│   ├── cta-section
│   │   └── index.tsx
│   ├── hero-section
│   │   └── index.tsx
│   └── portfolio-section
│   └── index.tsx
├── db
│   ├── auth.ts
│   └── client.ts
├── hooks
│   └── useQueryString.tsx
├── jest.config.js
├── libs
│   ├── endpoints.ts
│   ├── fonts.ts
│   └── utils.ts
├── LICENSE
├── middleware.ts
├── next.config.js
├── package.json
├── pnpm-lock.yaml
├── postcss.config.js
├── prisma
│   ├── migrations
│   │   ├── 20230905180828*init
│   │   │   └── migration.sql
│   │   ├── 20230909151534*
│   │   │   └── migration.sql
│   │   ├── 20230909152110*
│   │   │   └── migration.sql
│   │   ├── 20230909155530*
│   │   │   └── migration.sql
│   │   ├── 20230909172237*
│   │   │   └── migration.sql
│   │   ├── 20230909173756*
│   │   │   └── migration.sql
│   │   ├── 20230909174036*
│   │   │   └── migration.sql
│   │   ├── 20230909174500*
│   │   │   └── migration.sql
│   │   ├── 20230911184754*
│   │   │   └── migration.sql
│   │   ├── 20230911185256*
│   │   │   └── migration.sql
│   │   ├── 20230911185615*
│   │   │   └── migration.sql
│   │   ├── 20230912090647*
│   │   │   └── migration.sql
│   │   ├── 20230912090928*
│   │   │   └── migration.sql
│   │   ├── 20230912150754*
│   │   │   └── migration.sql
│   │   ├── 20230912153650*
│   │   │   └── migration.sql
│   │   ├── 20230914090140*
│   │   │   └── migration.sql
│   │   ├── 20230914091101*
│   │   │   └── migration.sql
│   │   ├── 20230914091541*
│   │   │   └── migration.sql
│   │   ├── 20230914143927\_
│   │   │   └── migration.sql
│   │   └── migration_lock.toml
│   └── schema.prisma
├── public
│   ├── article10.png
│   ├── article2.png
│   ├── article3.png
│   ├── article6.png
│   ├── article7.png
│   ├── article8.png
│   ├── article9.png
│   ├── articleBanner.png
│   ├── article.png
│   ├── articleSecondary.png
│   ├── author2.png
│   ├── author3.png
│   ├── author.png
│   ├── fonts
│   │   └── Eudoxus
│   │   ├── EudoxusSans-Bold.ttf
│   │   ├── EudoxusSans-ExtraBold.ttf
│   │   ├── EudoxusSans-ExtraLight.ttf
│   │   ├── EudoxusSans-Light.ttf
│   │   ├── EudoxusSans-Medium.ttf
│   │   └── EudoxusSans-Regular.ttf
│   ├── hero.png
│   ├── info1.png
│   ├── info2.png
│   ├── loginBanner.png
│   ├── logopng.png
│   ├── logo.svg
│   ├── next.svg
│   ├── product2.png
│   ├── product3.png
│   ├── product4.png
│   ├── product5.png
│   ├── product6.png
│   ├── product7.png
│   ├── product8.png
│   ├── product9.png
│   ├── product.png
│   ├── products
│   │   ├── 10.webp
│   │   ├── 1.webp
│   │   ├── 2.webp
│   │   ├── 3.webp
│   │   ├── 4.webp
│   │   ├── 5.webp
│   │   ├── 6.webp
│   │   ├── 7.webp
│   │   ├── 8.webp
│   │   └── 9.webp
│   ├── productsBanner.png
│   ├── productsBanner.webp
│   ├── serviceBanner.png
│   ├── team1.png
│   ├── team2.png
│   ├── team3.png
│   ├── team4.png
│   ├── team5.png
│   ├── team6.png
│   └── vercel.svg
├── README.md
├── store
│   ├── useLayoutStore.ts
│   └── useUserStore.ts
├── styles
│   └── global.css
├── tailwind.config.ts
├── **tests**
│   ├── ArticleCard.test.js
│   ├── Brand.test.js
│   ├── FilterButton.test.js
│   ├── OrderCard.test.js
│   ├── PageButton.test.js
│   └── ProductBanner.test.js
├── tsconfig.json
└── types
├── Article.ts
├── Author.ts
├── BasketItem.ts
├── Filters.ts
├── FooterNav.ts
├── HeaderNav.ts
├── Order.ts
├── Product.ts
├── Services.ts
├── TeamMember.ts
└── User.ts

147 directories, 240 files
