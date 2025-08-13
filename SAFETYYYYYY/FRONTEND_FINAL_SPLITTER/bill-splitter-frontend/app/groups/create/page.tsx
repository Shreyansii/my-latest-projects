// groups/create/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail, Loader2, X, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { apiClient } from '@/src/lib/api';

export default function CreateGroupPage() {
  const router = useRouter();

  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [participantsToInvite, setParticipantsToInvite] = useState<string[]>([]);
  const [newParticipantEmail, setNewParticipantEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleAddParticipant = () => {
    if (!newParticipantEmail.trim()) {
      return;
    }

    if (!emailRegex.test(newParticipantEmail.trim())) {
      toast.error('Invalid email format', {
        description: `"${newParticipantEmail}" is not a valid email address.`,
      });
      return;
    }

    setParticipantsToInvite([...participantsToInvite, newParticipantEmail.trim()]);
    setNewParticipantEmail('');
  };

  const handleRemoveParticipant = (emailToRemove: string) => {
    setParticipantsToInvite(
      participantsToInvite.filter((email) => email !== emailToRemove)
    );
  };

  const handleCreateGroup = async () => {
    setIsSubmitting(true);
    try {
      const groupData = {
        name: groupName,
        currency: 'USD',
        ...(description.trim() && { description: description.trim() }),
        ...(avatarUrl.trim() && { group_avatar_url: avatarUrl.trim() }),
      };

      const groupResponse = await apiClient.createGroup(groupData);
      const groupId = groupResponse.data?.id;

      if (!groupId) {
        throw new Error('Failed to create group or retrieve group ID.');
      }

      if (participantsToInvite.length > 0) {
        await apiClient.createGroupInvites({
          group: groupId,
          emails: participantsToInvite,
        });
      }

      toast.success('Group Created Successfully!', {
        description: `Group "${groupName}" has been created and invitations have been sent.`,
      });

      router.push(`/groups/${groupId}`);

    } catch (error: any) {
      console.error('Failed to create group:', error);
      toast.error('Error creating group', {
        description: error.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 pb-8 max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Create Group</h1>
            <p className="text-muted-foreground">Set up a new expense group</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* === Group Details Card === */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Group Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="group-name" className="mb-2 block">Group Name</Label>
              <Input
                id="group-name"
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="group-description" className="mb-2 block">Description (optional)</Label>
              <Input
                id="group-description"
                placeholder="Enter description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="group-avatar" className="mb-2 block">Avatar URL (optional)</Label>
              <Input
                id="group-avatar"
                placeholder="Enter avatar image URL"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
              />
              {/* Avatar Preview */}
              <div className="mt-4 flex items-center space-x-4">
                <div className="h-20 w-20 rounded-full border border-border flex items-center justify-center overflow-hidden bg-muted">
                  {avatarUrl.trim() ? (
                    <Image
                      src={avatarUrl.trim()}
                      alt="Group Avatar Preview"
                      width={80}
                      height={80}
                      className="object-cover h-full w-full"
                    />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <span className="text-sm text-muted-foreground">Avatar Preview</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* === Invite Participants Card === */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Invite Participants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="participant-email" className="mb-2 block">Email</Label>
              <div className="flex gap-2">
                <Input
                  id="participant-email"
                  type="email"
                  placeholder="Enter email"
                  value={newParticipantEmail}
                  onChange={(e) => setNewParticipantEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddParticipant()}
                />
                <Button onClick={handleAddParticipant}>
                  <Mail className="w-4 h-4 mr-2" />
                  Add Email
                </Button>
              </div>
            </div>
            {participantsToInvite.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Emails to invite:</p>
                <div className="flex flex-wrap gap-2">
                  {participantsToInvite.map((email, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-muted rounded-full pl-3 pr-1 py-1 text-sm text-foreground"
                    >
                      <span>{email}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 rounded-full p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => handleRemoveParticipant(email)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between pt-4">
        <Link href="/dashboard">
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button
          onClick={handleCreateGroup}
          disabled={isSubmitting || !groupName.trim()}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Group'
          )}
        </Button>
      </div>
    </div>
  );
}


// // groups/create/page.tsx

// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Label } from '@/components/ui/label';
// import { ArrowLeft, Mail, Loader2, Copy } from 'lucide-react';
// import Link from 'next/link';
// import { toast } from 'sonner';
// import { apiClient } from '@/src/lib/api';

// export default function CreateGroupPage() {
//   const router = useRouter();

//   const [groupName, setGroupName] = useState('');
//   const [description, setDescription] = useState('');
//   const [avatarUrl, setAvatarUrl] = useState('');
//   const [participantsToInvite, setParticipantsToInvite] = useState<string[]>([]);
//   const [newParticipantEmail, setNewParticipantEmail] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [inviteLink, setInviteLink] = useState(''); // State to store the generated link

//   const handleAddParticipant = () => {
//     if (!newParticipantEmail.trim()) return;
//     setParticipantsToInvite([...participantsToInvite, newParticipantEmail.trim()]);
//     setNewParticipantEmail('');
//   };

//   const handleCreateGroup = async () => {
//     setIsSubmitting(true);

//     try {
//       // Step 1: Create the group
//       const groupData = {
//         name: groupName,
//         currency: 'USD',
//         ...(description.trim() && { description: description.trim() }),
//         ...(avatarUrl.trim() && { group_avatar_url: avatarUrl.trim() }),
//       };

//       const groupResponse = await apiClient.createGroup(groupData);
//       const groupId = groupResponse.data?.id;

//       if (!groupId) {
//         throw new Error('Failed to create group or retrieve group ID.');
//       }

//       // Step 2 (Optional): Send email invites for added participants
//       if (participantsToInvite.length > 0) {
//         try {
//           await apiClient.createGroupInvites({
//             group: groupId,
//             emails: participantsToInvite,
//           });
//           toast.info('Invitations sent successfully!', {
//             description: 'Emails have been sent to the specified participants.',
//           });
//         } catch (inviteError) {
//           console.error('Failed to send email invites:', inviteError);
//           toast.warning('Group created, but failed to send email invitations.', {
//             description: 'You can still invite people using the generated link below.',
//           });
//         }
//       }

//       // Step 3: Generate the unique invite link
//       try {
//         const inviteResponse = await apiClient.createGroupInviteLink(groupId);
//         const inviteToken = inviteResponse.data?.token;

//         if (inviteToken) {
//           const fullInviteLink = `${window.location.origin}/invite/${inviteToken}`;
//           setInviteLink(fullInviteLink);
//         }
//       } catch (linkError) {
//         console.error('Failed to generate invite link:', linkError);
//         toast.warning('Group created, but failed to generate a shareable link.');
//       }

//       toast.success('Group Created Successfully!', {
//         description: `Group "${groupName}" is now active.`,
//       });

//     } catch (error: any) {
//       // This catch block is only for a failure in the initial group creation
//       console.error('Failed to create group:', error);
//       toast.error('Error creating group', {
//         description: error.message || 'Something went wrong. Please try again.',
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const copyToClipboard = () => {
//     navigator.clipboard.writeText(inviteLink);
//     toast.info('Link copied!', {
//       description: 'The invite link has been copied to your clipboard.',
//     });
//   };

//   return (
//     <div className="p-6 max-w-3xl mx-auto space-y-8">
//       {/* ... [Back to Dashboard] and [Create Group heading] remain the same ... */}
//       <div className="flex justify-between items-center mb-8">
//         <div className="flex items-center space-x-4">
//           <Link href="/dashboard">
//             <Button variant="outline" size="sm">
//               <ArrowLeft className="w-4 h-4 mr-2" />
//               Back to Dashboard
//             </Button>
//           </Link>
//           <div>
//             <h1 className="text-2xl font-bold">Create Group</h1>
//             <p className="text-gray-600">Set up a new expense group</p>
//           </div>
//         </div>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle>Group Details</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div>
//             <Label htmlFor="group-name">Group Name</Label>
//             <Input
//               id="group-name"
//               placeholder="Enter group name"
//               value={groupName}
//               onChange={(e) => setGroupName(e.target.value)}
//             />
//           </div>
//           <div>
//             <Label htmlFor="group-description">Description (optional)</Label>
//             <Input
//               id="group-description"
//               placeholder="Enter description"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//             />
//           </div>
//           <div>
//             <Label htmlFor="group-avatar">Avatar URL (optional)</Label>
//             <Input
//               id="group-avatar"
//               placeholder="Enter avatar image URL"
//               value={avatarUrl}
//               onChange={(e) => setAvatarUrl(e.target.value)}
//             />
//           </div>
//         </CardContent>
//       </Card>

//       {/* Re-added the Invite Participants card */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Invite Participants</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div>
//             <Label htmlFor="participant-email">Email</Label>
//             <div className="flex gap-2">
//               <Input
//                 id="participant-email"
//                 type="email"
//                 placeholder="Enter email"
//                 value={newParticipantEmail}
//                 onChange={(e) => setNewParticipantEmail(e.target.value)}
//                 onKeyPress={(e) => e.key === 'Enter' && handleAddParticipant()}
//               />
//               <Button onClick={handleAddParticipant}>
//                 <Mail className="w-4 h-4 mr-2" />
//                 Add Email
//               </Button>
//             </div>
//           </div>
//           {participantsToInvite.length > 0 && (
//             <div className="space-y-2">
//               <p className="text-sm font-medium text-gray-700">Emails to invite:</p>
//               <ul className="list-disc pl-6 text-sm text-gray-600 space-y-1">
//                 {participantsToInvite.map((email, idx) => (
//                   <li key={idx}>{email}</li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Conditionally show the invite link card after a group is created */}
//       {inviteLink && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Shareable Invite Link</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <p className="text-sm text-gray-700">
//               You can also share this link with anyone to invite them to the group.
//             </p>
//             <div className="flex items-center gap-2">
//               <Input value={inviteLink} readOnly />
//               <Button onClick={copyToClipboard}>
//                 <Copy className="w-4 h-4" />
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       <div className="flex justify-between pt-4">
//         <Link href="/dashboard">
//           <Button variant="outline">Cancel</Button>
//         </Link>
//         <Button
//           onClick={handleCreateGroup}
//           disabled={isSubmitting || !groupName.trim() || inviteLink}
//         >
//           {isSubmitting ? (
//             <>
//               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//               Creating...
//             </>
//           ) : (
//             'Create Group'
//           )}
//         </Button>
//       </div>
//     </div>
//   );
// }




// // groups/create/page.tsx

// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Label } from '@/components/ui/label';
// import { ArrowLeft, Mail, Loader2 } from 'lucide-react';
// import Link from 'next/link';
// import { toast } from 'sonner';
// // FIX: Import the apiClient to use the centralized API functions
// import { apiClient } from '@/src/lib/api';

// export default function CreateGroupPage() {
//   const router = useRouter();

//   const [groupName, setGroupName] = useState('');
//   const [description, setDescription] = useState('');
//   const [avatarUrl, setAvatarUrl] = useState('');
//   const [participantsToInvite, setParticipantsToInvite] = useState<string[]>([]);
//   const [newParticipantEmail, setNewParticipantEmail] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleAddParticipant = () => {
//     if (!newParticipantEmail.trim()) return;
//     setParticipantsToInvite([...participantsToInvite, newParticipantEmail.trim()]);
//     setNewParticipantEmail('');
//   };

//   const handleCreateGroup = async () => {
//     setIsSubmitting(true);
//     try {
//       const groupData = {
//         name: groupName,
//         currency: 'USD',
//         ...(description.trim() && { description: description.trim() }),
//         ...(avatarUrl.trim() && { group_avatar_url: avatarUrl.trim() }),
//       };

//       // FIX: Use apiClient.createGroup instead of a raw fetch call.
//       const groupResponse = await apiClient.createGroup(groupData);
//       const groupId = groupResponse.data?.id;

//       if (!groupId) {
//         throw new Error('Failed to create group or retrieve group ID.');
//       }

//       if (participantsToInvite.length > 0) {
//         // FIX: Use apiClient.createGroupInvites with the correct data structure.
//         await apiClient.createGroupInvites({
//           group: groupId,
//           emails: participantsToInvite,
//         });
//       }

//       toast.success('Group Created Successfully!', {
//         description: `Group "${groupName}" has been created and invitations have been sent.`,
//       });

//       router.push(`/groups/${groupId}`);

//     } catch (error: any) {
//       console.error('Failed to create group:', error);
//       toast.error('Error creating group', {
//         description: error.message || 'Something went wrong. Please try again.',
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="p-6 max-w-3xl mx-auto space-y-8">
//       <div className="flex justify-between items-center mb-8">
//         <div className="flex items-center space-x-4">
//           <Link href="/dashboard">
//             <Button variant="outline" size="sm">
//               <ArrowLeft className="w-4 h-4 mr-2" />
//               Back to Dashboard
//             </Button>
//           </Link>
//           <div>
//             <h1 className="text-2xl font-bold">Create Group</h1>
//             <p className="text-gray-600">Set up a new expense group</p>
//           </div>
//         </div>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle>Group Details</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div>
//             <Label htmlFor="group-name">Group Name</Label>
//             <Input
//               id="group-name"
//               placeholder="Enter group name"
//               value={groupName}
//               onChange={(e) => setGroupName(e.target.value)}
//             />
//           </div>
//           <div>
//             <Label htmlFor="group-description">Description (optional)</Label>
//             <Input
//               id="group-description"
//               placeholder="Enter description"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//             />
//           </div>
//           <div>
//             <Label htmlFor="group-avatar">Avatar URL (optional)</Label>
//             <Input
//               id="group-avatar"
//               placeholder="Enter avatar image URL"
//               value={avatarUrl}
//               onChange={(e) => setAvatarUrl(e.target.value)}
//             />
//           </div>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle>Invite Participants</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div>
//             <Label htmlFor="participant-email">Email</Label>
//             <div className="flex gap-2">
//               <Input
//                 id="participant-email"
//                 type="email"
//                 placeholder="Enter email"
//                 value={newParticipantEmail}
//                 onChange={(e) => setNewParticipantEmail(e.target.value)}
//                 onKeyPress={(e) => e.key === 'Enter' && handleAddParticipant()}
//               />
//               <Button onClick={handleAddParticipant}>
//                 <Mail className="w-4 h-4 mr-2" />
//                 Add Email
//               </Button>
//             </div>
//           </div>
//           {participantsToInvite.length > 0 && (
//             <div className="space-y-2">
//               <p className="text-sm font-medium text-gray-700">Emails to invite:</p>
//               <ul className="list-disc pl-6 text-sm text-gray-600 space-y-1">
//                 {participantsToInvite.map((email, idx) => (
//                   <li key={idx}>{email}</li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       <div className="flex justify-between pt-4">
//         <Link href="/dashboard">
//           <Button variant="outline">Cancel</Button>
//         </Link>
//         <Button
//           onClick={handleCreateGroup}
//           disabled={isSubmitting || !groupName.trim()}
//         >
//           {isSubmitting ? (
//             <>
//               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//               Creating...
//             </>
//           ) : (
//             'Create Group'
//           )}
//         </Button>
//       </div>
//     </div>
//   );
// }





// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Label } from '@/components/ui/label';
// import { ArrowLeft, Mail, Loader2 } from 'lucide-react';
// import Link from 'next/link';
// import { toast } from 'sonner'; // Corrected import path for Sonner
// import { apiClient } from '@/src/lib/api';

// export default function CreateGroupPage() {
//   const router = useRouter();

//   const [groupName, setGroupName] = useState('');
//   // const [categories, setCategories] = useState<string[]>([]);
//   const [newCategory, setNewCategory] = useState('');
//   const [participantsToInvite, setParticipantsToInvite] = useState<string[]>([]);
//   const [newParticipantEmail, setNewParticipantEmail] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // const handleAddCategory = () => {
//   //   if (!newCategory.trim()) return;
//   //   setCategories([...categories, newCategory.trim()]);
//   //   setNewCategory('');
//   // };

//   const handleAddParticipant = () => {
//     if (!newParticipantEmail.trim()) return;
//     setParticipantsToInvite([...participantsToInvite, newParticipantEmail.trim()]);
//     setNewParticipantEmail('');
//   };

//   const handleCreateGroup = async () => {
//     setIsSubmitting(true);
//     try {
//       const groupData = {
//         name: groupName,
//         // Add other fields like description, currency if needed
//       };

//       const groupResponse = await apiClient.createGroup(groupData);

//       if (!groupResponse.data?.id) {
//         throw new Error('Failed to create group. No ID returned from server.');
//       }

//       const groupId = groupResponse.data.id;

//       if (participantsToInvite.length > 0) {
//         const inviteData = {
//           group: groupId,
//           emails: participantsToInvite,
//         };
//         await apiClient.createGroupInvites(inviteData);
//       }

//       // Using Sonner's toast function directly
//       toast.success('Group Created Successfully!', {
//         description: `Group "${groupName}" has been created and invitations have been sent.`,
//       });

//       router.push(`/dashboard`);
//     } catch (error: any) {
//       console.error('Failed to create group:', error);
//       const errorMessage = error.message || 'Something went wrong. Please try again.';

//       // Using Sonner's toast function for errors
//       toast.error('Error creating group', {
//         description: errorMessage,
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="p-6 max-w-3xl mx-auto space-y-8">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-8">
//         <div className="flex items-center space-x-4">
//           <Link href="/dashboard">
//             <Button variant="outline" size="sm">
//               <ArrowLeft className="w-4 h-4 mr-2" />
//               Back to Dashboard
//             </Button>
//           </Link>
//           <div>
//             <h1 className="text-2xl font-bold">Create Group</h1>
//             <p className="text-gray-600">Set up a new expense group</p>
//           </div>
//         </div>
//       </div>

//       {/* Group Name */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Group Details</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div>
//             <Label htmlFor="group-name">Group Name</Label>
//             <Input
//               id="group-name"
//               placeholder="Enter group name"
//               value={groupName}
//               onChange={(e) => setGroupName(e.target.value)}
//             />
//           </div>
//         </CardContent>
//       </Card>

//       {/* Add Categories
//       <Card>
//         <CardHeader>
//           <CardTitle>Add Categories</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="flex gap-2">
//             <Input
//               placeholder="Enter category name"
//               value={newCategory}
//               onChange={(e) => setNewCategory(e.target.value)}
//               onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
//             />
//             <Button onClick={handleAddCategory}>Add</Button>
//           </div>
//           {categories.length > 0 && (
//             <div className="space-y-2">
//               <p className="text-sm font-medium text-gray-700">Categories added:</p>
//               <ul className="list-disc pl-6 text-sm text-gray-600 space-y-1">
//                 {categories.map((cat, idx) => (
//                   <li key={idx}>{cat}</li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </CardContent>
//       </Card> */}

//       {/* Invite Participants */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Invite Participants</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div>
//             <Label htmlFor="participant-email">Email</Label>
//             <div className="flex gap-2">
//               <Input
//                 id="participant-email"
//                 type="email"
//                 placeholder="Enter email"
//                 value={newParticipantEmail}
//                 onChange={(e) => setNewParticipantEmail(e.target.value)}
//                 onKeyPress={(e) => e.key === 'Enter' && handleAddParticipant()}
//               />
//               <Button onClick={handleAddParticipant}>
//                 <Mail className="w-4 h-4 mr-2" />
//                 Add Email
//               </Button>
//             </div>
//           </div>
//           {participantsToInvite.length > 0 && (
//             <div className="space-y-2">
//               <p className="text-sm font-medium text-gray-700">Emails to invite:</p>
//               <ul className="list-disc pl-6 text-sm text-gray-600 space-y-1">
//                 {participantsToInvite.map((email, idx) => (
//                   <li key={idx}>{email}</li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Action buttons */}
//       <div className="flex justify-between pt-4">
//         <Link href="/dashboard">
//           <Button variant="outline">Cancel</Button>
//         </Link>
//         <div className="space-x-2">
//           <Button onClick={handleCreateGroup} disabled={isSubmitting || !groupName.trim()}>
//             {isSubmitting ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Creating...
//               </>
//             ) : (
//               'Create Group'
//             )}
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }












// 'use client';

// import { useState } from 'react';

// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// import { Input } from '@/components/ui/input';

// import { Button } from '@/components/ui/button';

// import { Label } from '@/components/ui/label';

// import { Plus, ArrowLeft } from 'lucide-react';

// import Link from 'next/link';

 

// export default function GroupsPage() {

// const [categories, setCategories] = useState<string[]>([]);

// const [newCategory, setNewCategory] = useState('');

// const [participants, setParticipants] = useState<{ name: string; email: string }[]>([]);

// const [newParticipant, setNewParticipant] = useState({ name: '', email: '' });

// const [inviteLink, setInviteLink] = useState('');

 

// const handleAddCategory = () => {

// if (!newCategory.trim()) return;

// setCategories([...categories, newCategory.trim()]);

// setNewCategory('');

// };

 

// const handleAddParticipant = () => {

// if (!newParticipant.name.trim() || !newParticipant.email.trim()) return;

// setParticipants([...participants, { ...newParticipant }]);

// setNewParticipant({ name: '', email: '' });

// };

 

// const handleGenerateInviteLink = () => {

// const randomCode = Math.random().toString(36).substring(2, 8);

// setInviteLink(`${window.location.origin}/join/${randomCode}`);

// };

 

// return (

// <div className="p-6 max-w-3xl mx-auto space-y-8">

// {/* Header with navigation and actions */}

// <div className="flex justify-between items-center mb-8">

// <div className="flex items-center space-x-4">

// <Link href="/dashboard">

// <Button variant="outline" size="sm">

// <ArrowLeft className="w-4 h-4 mr-2" />

// Back to Dashboard

// </Button>

// </Link>

// <div>

// <h1 className="text-2xl font-bold">Create Group</h1>

// <p className="text-gray-600">Set up a new expense group</p>

// </div>

// </div>

// <Link href="/expenses/new">

// <Button>

// <Plus className="w-4 h-4 mr-2" />

// Add Expense

// </Button>

// </Link>

// </div>

 

// {/* Add Category */}

// <Card>

// <CardHeader>

// <CardTitle>Add Categories</CardTitle>

// </CardHeader>

// <CardContent className="space-y-4">

// <div className="flex gap-2">

// <Input

// placeholder="Enter category name"

// value={newCategory}

// onChange={(e) => setNewCategory(e.target.value)}

// onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}

// />

// <Button onClick={handleAddCategory}>Add</Button>

// </div>

// {categories.length > 0 && (

// <div className="space-y-2">

// <p className="text-sm font-medium text-gray-700">Categories added:</p>

// <ul className="list-disc pl-6 text-sm text-gray-600 space-y-1">

// {categories.map((cat, idx) => (

// <li key={idx}>{cat}</li>

// ))}

// </ul>

// </div>

// )}

// </CardContent>

// </Card>

 

// {/* Add Participants */}

// <Card>

// <CardHeader>

// <CardTitle>Add Participants</CardTitle>

// </CardHeader>

// <CardContent className="space-y-4">

// <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

// <div>

// <Label htmlFor="participant-name">Name</Label>

// <Input

// id="participant-name"

// placeholder="Enter name"

// value={newParticipant.name}

// onChange={(e) =>

// setNewParticipant({ ...newParticipant, name: e.target.value })

// }

// />

// </div>

// <div>

// <Label htmlFor="participant-email">Email</Label>

// <Input

// id="participant-email"

// type="email"

// placeholder="Enter email"

// value={newParticipant.email}

// onChange={(e) =>

// setNewParticipant({ ...newParticipant, email: e.target.value })

// }

// />

// </div>

// </div>

// <Button onClick={handleAddParticipant}>Add Participant</Button>

// {participants.length > 0 && (

// <div className="space-y-2">

// <p className="text-sm font-medium text-gray-700">Participants added:</p>

// <ul className="list-disc pl-6 text-sm text-gray-600 space-y-1">

// {participants.map((p, idx) => (

// <li key={idx}>

// {p.name} ({p.email})

// </li>

// ))}

// </ul>

// </div>

// )}

// </CardContent>

// </Card>

 

// {/* Invite Link */}

// <Card>

// <CardHeader>

// <CardTitle>Invite Link</CardTitle>

// </CardHeader>

// <CardContent className="space-y-4">

// <Button variant="secondary" onClick={handleGenerateInviteLink}>

// Generate Invite Link

// </Button>

// {inviteLink && (

// <div className="space-y-2">

// <p className="text-sm font-medium text-gray-700">Share this link with others:</p>

// <div className="p-3 bg-gray-100 rounded text-sm break-all font-mono">

// {inviteLink}

// </div>

// <Button

// variant="outline"

// size="sm"

// onClick={() => navigator.clipboard.writeText(inviteLink)}

// >

// Copy Link

// </Button>

// </div>

// )}

// </CardContent>

// </Card>

 

// {/* Action buttons */}

// <div className="flex justify-between pt-4">

// <Link href="/dashboard">

// <Button variant="outline">Cancel</Button>

// </Link>

// <div className="space-x-2">

// <Button variant="secondary">Save as Draft</Button>

// <Button>Create Group</Button>

// </div>

// </div>

// </div>

// );

// }


