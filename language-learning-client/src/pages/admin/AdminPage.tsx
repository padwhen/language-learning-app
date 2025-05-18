import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock data
const mockUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    xp: 1250,
    streak: 5,
    lastActive: "2024-03-20",
    isAdmin: false,
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    xp: 2800,
    streak: 12,
    lastActive: "2024-03-21",
    isAdmin: true,
  },
  // Add more mock users as needed
];

const mockDecks = [
  {
    id: 1,
    name: "Basic Spanish",
    cardCount: 50,
    creator: "John Doe",
    createdAt: "2024-03-15",
  },
  {
    id: 2,
    name: "Advanced French",
    cardCount: 75,
    creator: "Jane Smith",
    createdAt: "2024-03-18",
  },
  // Add more mock decks as needed
];

const mockStats = {
  totalUsers: 150,
  totalDecks: 25,
  activeUsers: 45,
  totalCards: 1250,
};

export default function AdminPage() {
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [selectedDeck, setSelectedDeck] = useState<number | null>(null);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{mockStats.totalUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Decks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{mockStats.totalDecks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{mockStats.activeUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{mockStats.totalCards}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="decks">Decks</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage user accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Input placeholder="Search users..." className="max-w-sm" />
                <Button>Add User</Button>
              </div>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>XP</TableHead>
                      <TableHead>Streak</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.xp}</TableCell>
                        <TableCell>{user.streak}</TableCell>
                        <TableCell>{user.lastActive}</TableCell>
                        <TableCell>
                          <Badge variant={user.isAdmin ? "default" : "secondary"}>
                            {user.isAdmin ? "Admin" : "User"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" className="mr-2">
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm">
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Decks Tab */}
        <TabsContent value="decks">
          <Card>
            <CardHeader>
              <CardTitle>Deck Management</CardTitle>
              <CardDescription>View and manage flashcard decks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Input placeholder="Search decks..." className="max-w-sm" />
                <Button>Create Deck</Button>
              </div>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Cards</TableHead>
                      <TableHead>Creator</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockDecks.map((deck) => (
                      <TableRow key={deck.id}>
                        <TableCell>{deck.name}</TableCell>
                        <TableCell>{deck.cardCount}</TableCell>
                        <TableCell>{deck.creator}</TableCell>
                        <TableCell>{deck.createdAt}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" className="mr-2">
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm">
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Manual Tasks</CardTitle>
              <CardDescription>Trigger backend tasks manually</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Weekly Rankings</h3>
                    <p className="text-sm text-muted-foreground">
                      Calculate and update weekly user rankings
                    </p>
                  </div>
                  <Button>Run Now</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Streak Updates</h3>
                    <p className="text-sm text-muted-foreground">
                      Update user streaks based on activity
                    </p>
                  </div>
                  <Button>Run Now</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 