"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  CirclePlus,
  Folder,
  ListPlus,
  Trash2,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";

const formSchema = z.object({
  picture: z
    .any()
    .refine(
      (file) => file?.length === 1,
      "*Supported image formats include JPEG, PNG"
    )
    .refine(
      (file) => file[0]?.type === "image/png" || file[0]?.type === "image/jpeg",
      "Must be a png or jpeg"
    )
    .refine((file) => file[0]?.size <= 5000000, "Max file size is 5MB."),
  companyName: z.string().min(2, {
    message: "Company name is not recognised. Please try again.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  mobile: z.string().min(10, {
    message: "Please enter a valid mobile number",
  }),
});

const ClientDetails = () => {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      picture: "",
      companyName: "",
      email: "",
      mobile: "",
    },
  });

  const onSubmit = (data: any) => {
    console.log(data);
    router.push("/welcome4");
  };

  const handleImageChange = (files: any) => {
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as any);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <Grid
            container
            rowSpacing={1}
            columnSpacing={{ xs: 1, sm: 2, md: 3 }}
            style={{ height: "auto", margin: 0, width: "100%" }}
          >
            <Grid item xs={10} style={{ height: "10vh", padding: 10 }}>
              <div className="flex items-center gap-2 mt-0">
                <h4
                  className="text-base font-medium text-primary_color cursor-pointer"
                  onClick={() => router.back()}
                >
                  Client List
                </h4>
                <ChevronRight />
                <h4 className="text-base font-medium text-primary_color">
                  Add New Client
                </h4>
              </div>
            </Grid>
            <Grid item xs={2} style={{ height: "10vh", padding: 10 }}>
              <div className="flex items-center gap-6 w-full">
                <Button className="hover:opacity-75 w-2/4">Save</Button>
                <Button variant={"outline"} className="w-2/4 bg-button_gray">
                  Discard
                </Button>
              </div>
            </Grid>

            <Grid item xs={2} style={{ height: "50vh", padding: 10 }}>
              <FormField
                control={form.control}
                name="picture"
                render={({ field }) => (
                  <FormItem className="mt-0 pb-2">
                    <FormControl>
                      <div className="flex justify-center mt-5">
                        <div className="relative w-32 h-32 rounded-full bg-gray-200">
                          <Input
                            type="file"
                            accept="image/png, image/jpeg"
                            placeholder="Upload Image"
                            className="absolute w-full h-full opacity-0 cursor-pointer z-20"
                            onChange={(e) => {
                              field.onChange(e.target.files);
                              handleImageChange(e.target.files);
                            }}
                          />
                          <Image
                            src={imageUrl || "/images/profile.png"}
                            alt="Profile Image"
                            layout="fill"
                            objectFit="cover"
                            className="rounded-full z-0"
                          />
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage className="text-center" />
                  </FormItem>
                )}
              />
              {/* <p className="text-center text-sm font-bold text-primary_color">
                Active Screens
              </p>
              <h2 className="text-center text-lg font-bold text-primary_color mb-2">
                5869
              </h2>
              <p className="text-center text-sm font-bold text-primary_color">
                InActive Screens
              </p>
              <h3 className="text-center text-lg font-bold text-primary_color mb-2">
                23
              </h3> */}
            </Grid>
            <Grid item xs={5} style={{ height: "50vh", padding: 10 }}>
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem className="mt-0 pb-3">
                    <FormLabel>Client Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Client Name here" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="mt-0 pb-3">
                    <FormLabel className="mb-2">Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter the Address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem className="mt-0 pb-3">
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter the Website" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem className="mt-0 pb-3">
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter the State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem className="mt-0 pb-3">
                    <FormLabel>Username / Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter the Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem className="mt-0 pb-3">
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter the Role" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Grid>
            <Grid item xs={5} style={{ height: "50vh", padding: 10 }}>
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem className="mt-0 pb-3">
                    <FormLabel>Mobile</FormLabel>
                    <FormControl>
                      <Input placeholder="+61 0000 0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem className="mt-0 pb-3">
                    <FormLabel>Zip Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter the Zip Code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem className="mt-0 pb-3">
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter the City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem className="mt-0 pb-3">
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter the Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem className="mt-0 pb-3">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="*****" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem className="mt-0 pb-3">
                    <FormLabel>Plan</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter the Plan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* <Button
                type="submit"
                className="w-full bg-button_orange hover:bg-button_orange hover:opacity-75"
                style={{ marginTop: "30px" }}
              >
                Save & Continue
              </Button> */}
            </Grid>
          </Grid>
        </form>
      </Form>
    </Box>
  );
};

export default ClientDetails;
