import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Home, Activity, MessageSquare, CreditCard, Stethoscope, Dna, Heart, Brain, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import AppLogo from "@/components/app-logo";
import AuthHeader from "./auth-header";
import type { User } from "@/hooks/useAuth";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface HeaderProps {
  userRole: "patient" | "provider";
  onRoleChange: (role: "patient" | "provider") => void;
  logoUrl?: string;
  title?: string;
  user?: User;
}

export default function Header({ 
  userRole, 
  onRoleChange, 
  logoUrl, 
  title = "DNA Diet Club",
  user
}: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <AppLogo logoUrl={logoUrl} title={title} />

          {/* Navigation Menu */}
          {user && (
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link href="/">
                    <NavigationMenuLink className={cn(navigationMenuTriggerStyle())}>
                      <Home className="w-4 h-4 mr-2" />
                      Dashboard
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    <Dna className="w-4 h-4 mr-2" />
                    Services
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                      <div className="row-span-3">
                        <NavigationMenuLink asChild>
                          <div className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md">
                            <Dna className="h-6 w-6" />
                            <div className="mb-2 mt-4 text-lg font-medium">
                              DNA Diet Club
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              Personalized health plans powered by AI and genetic insights
                            </p>
                          </div>
                        </NavigationMenuLink>
                      </div>
                      <div className="grid gap-1">
                        <NavigationMenuLink asChild>
                          <div className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            <Activity className="h-4 w-4 inline mr-2" />
                            <div className="text-sm font-medium leading-none">Health Monitoring</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Real-time glucose tracking with Dexcom CGM integration
                            </p>
                          </div>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <div className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            <Brain className="h-4 w-4 inline mr-2" />
                            <div className="text-sm font-medium leading-none">AI Nutrition Plans</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Personalized meal plans powered by Grok AI
                            </p>
                          </div>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <div className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            <Heart className="h-4 w-4 inline mr-2" />
                            <div className="text-sm font-medium leading-none">Health Predictions</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Predictive analytics for heart attack and cancer risk
                            </p>
                          </div>
                        </NavigationMenuLink>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {user.type === 'patient' && (
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Support
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid gap-3 p-4 w-[300px]">
                        <NavigationMenuLink asChild>
                          <div className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            <div className="text-sm font-medium leading-none">Provider Messages</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Secure communication with your healthcare provider
                            </p>
                          </div>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link href="/privacy-policy">
                            <div className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                              <div className="text-sm font-medium leading-none">Privacy Policy</div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                HIPAA-compliant privacy and data protection
                              </p>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                )}

                {user.type === 'provider' && (
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>
                      <Stethoscope className="w-4 h-4 mr-2" />
                      Provider Tools
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid gap-3 p-4 w-[350px]">
                        <NavigationMenuLink asChild>
                          <div className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            <div className="text-sm font-medium leading-none">AI Plan Generator</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Generate personalized treatment plans with AI analysis
                            </p>
                          </div>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <div className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            <div className="text-sm font-medium leading-none">Patient Management</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Monitor all patients and their health trends
                            </p>
                          </div>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <div className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            <div className="text-sm font-medium leading-none">Lab Analysis</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Upload and analyze lab results and gut biome tests
                            </p>
                          </div>
                        </NavigationMenuLink>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>
          )}

          {/* Mobile Navigation */}
          {user && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>DNA Diet Club</SheetTitle>
                  <SheetDescription>
                    Personalized health and wellness platform
                  </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                  <Link href="/">
                    <Button variant="ghost" className="w-full justify-start">
                      <Home className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-700">Services</h4>
                    <div className="space-y-1 pl-4">
                      <div className="text-sm text-gray-600">
                        <Activity className="w-4 h-4 inline mr-2" />
                        Health Monitoring
                      </div>
                      <div className="text-sm text-gray-600">
                        <Brain className="w-4 h-4 inline mr-2" />
                        AI Nutrition Plans
                      </div>
                      <div className="text-sm text-gray-600">
                        <Heart className="w-4 h-4 inline mr-2" />
                        Health Predictions
                      </div>
                    </div>
                  </div>

                  {user.type === 'patient' && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-700">Support</h4>
                      <div className="space-y-1 pl-4">
                        <div className="text-sm text-gray-600">Provider Messages</div>
                        <Link href="/privacy-policy">
                          <div className="text-sm text-gray-600 hover:text-gray-800">Privacy Policy</div>
                        </Link>
                      </div>
                    </div>
                  )}

                  {user.type === 'provider' && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-700">Provider Tools</h4>
                      <div className="space-y-1 pl-4">
                        <div className="text-sm text-gray-600">AI Plan Generator</div>
                        <div className="text-sm text-gray-600">Patient Management</div>
                        <div className="text-sm text-gray-600">Lab Analysis</div>
                      </div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          )}

          {/* Authentication Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <AuthHeader user={user} />
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">View as:</span>
                <Button
                  variant={userRole === "patient" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onRoleChange("patient")}
                >
                  Patient
                </Button>
                <Button
                  variant={userRole === "provider" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onRoleChange("provider")}
                >
                  Provider
                </Button>
              </div>
            )}
            
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>System Online</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}