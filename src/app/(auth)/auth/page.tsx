"use client";

import { registerWithEmail } from "@/actions/register-with-email";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Typography from "@/components/ui/typography";
import { supabaseClient } from "@/supabase/supabaseClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { Provider } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { BsSlack } from "react-icons/bs";
import { FcGoogle } from "react-icons/fc";
import { MdOutlineAutoAwesome } from "react-icons/md";
import { RxGithubLogo } from "react-icons/rx";
import { z } from "zod";

const AuthPage = () => {
	const [isAuthenticating, setIsAuthenticating] = useState(false);
	const [isMounted, setIsMounted] = useState(false);

    const router = useRouter();

	useEffect(() => {
		const getCurrentUser = async () => {
			const {
				data: { session },
			} = await supabaseClient.auth.getSession();

            if (session) {
                return router.push("/");
            }
		};

		getCurrentUser();
		setIsMounted(true);
	}, []);

	const formSchema = z.object({
		email: z
			.string()
			.email()
			.min(2, { message: "Email must be at least 2 characters" }),
	});

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setIsAuthenticating(true);
		const response = await registerWithEmail(values);
		const { error } = JSON.parse(response);
		setIsAuthenticating(false);
		if (error) {
			console.warn("SIGN IN ERROR", error);
			console.log(values);
			return;
		}
	}

	async function socialAuth(provider: Provider) {
		setIsAuthenticating(true);
		await supabaseClient.auth.signInWithOAuth({
			provider,
			options: {
				redirectTo: `${location.origin}/auth/callback`,
			},
		});
		setIsAuthenticating(false);
	}

	if (!isMounted) {
		return null;
	}

	return (
		<div className="min-h-screen p-5 grid text-center place-content-center bg-white">
			<div className="max-w-[450px]">
				<div className="flex justify-center items-center gap-3 mb-4">
					<BsSlack size={30} />
					<Typography text="Huddle" variant="h2" />
				</div>
				<Typography
					text="Sign in to your Huddle"
					variant="h2"
					className="mb-3"
				/>

				<Typography
					text="We suggest using your work email address"
					variant="p"
					className="opacity-90 mb-7"
				/>

				<div className="flex flex-col space-y-4">
					<Button
						variant="outline"
						className="py-6 border-2 flex space-x-3"
						disabled={isAuthenticating}
						onClick={() => socialAuth("google")}
					>
						<FcGoogle size={30} />
						<Typography
							text="Sign in with Google"
							variant="p"
							className="text-xl"
						/>
					</Button>
					<Button
						variant="outline"
						className="py-6 border-2 flex space-x-3"
						disabled={isAuthenticating}
						onClick={() => socialAuth("github")}
					>
						<RxGithubLogo size={30} />
						<Typography
							text="Sign in with Github"
							variant="p"
							className="text-xl"
						/>
					</Button>
				</div>
				<div>
					<div className="flex items-center my-6">
						<div className="mr-[10px] flex-1 border-t bg-neutral-300" />
						<Typography text="OR" variant="p" />
						<div className="ml-[10px] flex-1 border-t bg-neutral-300" />
					</div>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)}>
							<fieldset disabled={isAuthenticating}>
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Input
													placeholder="name@workemail.com"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<Button
									variant="secondary"
									type="submit"
									className="bg-primary-dark hover:bg-primary-dark/90 w-full my-5 text-white"
								>
									<Typography
										text="Sign in with email"
										variant="p"
									/>
								</Button>

								<div className="px-5 py-4 bg-gray-100 rounded-sm">
									<div className="text-gray-500 flex items-center space-x-3">
										<MdOutlineAutoAwesome />
										<Typography
											text="We'll email you a magic link for a password-free sign in"
											variant="p"
										/>
									</div>
								</div>
							</fieldset>
						</form>
					</Form>
				</div>
			</div>
		</div>
	);
};

export default AuthPage;
