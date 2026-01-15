import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import type { JobPost } from '../store/useStore';
import { Button } from '../components/ui/button';
import { Plus, MapPin, Calendar, MessageCircle, MoreVertical, CheckCircle2 } from 'lucide-react';
import { CreateJobModal } from '../components/jobs/CreateJobModal';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const EMOJIS = ['👍', '👀', '🚛', '🔥'];

export default function DiscoveryBoard() {
    const { jobs, fetchJobs, currentUser, reactToJob, updateJobStatus } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const handleInquire = (job: JobPost) => {
        if (!currentUser) return;
        // For now, we navigate to messages and they can start a conversation
        // or we could eventually auto-fill a message
        navigate(`/${currentUser.role}/messages`, {
            state: {
                recipientId: job.postedBy.id,
                initialMessage: `Hi, I'm inquiring about your job: ${job.title} (${job.origin} to ${job.destination})`
            }
        });
    };

    const handleToggleStatus = async (jobId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'open' ? 'filled' : 'open';
        try {
            await updateJobStatus(jobId, newStatus as any);
            toast.success(`Job marked as ${newStatus}`);
        } catch (error) {
            toast.error('Failed to update job status');
        }
    };

    const JobCard = ({ job }: { job: JobPost }) => {
        const isOwner = currentUser?.id === job.postedBy.id || currentUser?.role === 'admin';
        const hasReacted = (emoji: string) =>
            job.reactions?.some(r => r.user === currentUser?.id && r.emoji === emoji);

        // Group reactions
        const reactionsCount = (job.reactions || []).reduce((acc, curr) => {
            acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return (
            <div className="bg-white rounded-2xl shadow-sm border border-border p-6 hover:shadow-md transition-shadow relative group">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border-2 border-[#ba0b0b]/10">
                            <AvatarImage src={job.postedBy.avatar} />
                            <AvatarFallback className="bg-[#ba0b0b] text-white">
                                {job.postedBy.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-bold text-lg leading-tight">{job.title}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                Posted by <span className="font-medium text-foreground">{job.postedBy.id === currentUser?.id ? 'You' : job.postedBy.name}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant={job.status === 'open' ? 'secondary' : 'outline'} className={job.status === 'open' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}>
                            {job.status.toUpperCase()}
                        </Badge>
                        {isOwner && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical size={16} />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleToggleStatus(job.id, job.status)}>
                                        <CheckCircle2 size={14} className="mr-2" />
                                        {job.status === 'open' ? 'Mark as Filled' : 'Reopen Job'}
                                    </DropdownMenuItem>
                                    {/* We could add delete here too */}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#ba0b0b]">
                            <MapPin size={14} />
                        </div>
                        <span>{job.origin} → {job.destination}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#ba0b0b]">
                            <Calendar size={14} />
                        </div>
                        <span>{new Date(job.pickupDate).toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl mb-4 border border-slate-100">
                    <p className="text-sm text-slate-700 line-clamp-3 italic">"{job.description}"</p>
                </div>

                <div className="flex items-center justify-between mt-auto pt-2">
                    <div className="flex items-center gap-1 text-[#ba0b0b] font-bold">
                        {job.budget > 0 ? (
                            <>
                                <span className="text-sm font-extrabold">ZMW</span>
                                <span className="text-xl tracking-tighter">{job.budget.toLocaleString()}</span>
                            </>
                        ) : (
                            <span className="text-lg tracking-tight">Negotiable</span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {!isOwner && (
                            <Button
                                onClick={() => handleInquire(job)}
                                className="bg-[#ba0b0b] hover:bg-[#950606] h-9 gap-2"
                                size="sm"
                            >
                                <MessageCircle size={16} />
                                Inquire
                            </Button>
                        )}
                    </div>
                </div>

                {/* Reactions Section */}
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-50">
                    {EMOJIS.map(emoji => (
                        <button
                            key={emoji}
                            onClick={() => reactToJob(job.id, emoji)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all border
                 ${hasReacted(emoji)
                                    ? 'bg-[#ba0b0b]/10 border-[#ba0b0b]/20 text-[#ba0b0b] scale-105'
                                    : 'bg-slate-50 border-transparent hover:border-slate-300'
                                }
               `}
                        >
                            <span>{emoji}</span>
                            {reactionsCount[emoji] > 0 && <span className="font-bold">{reactionsCount[emoji]}</span>}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 max-w-7xl mx-auto min-h-screen bg-slate-50/50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Discovery Board
                        <Badge className="bg-green-500 hover:bg-green-600 text-[10px] animate-pulse">LIVE MARKET</Badge>
                    </h1>
                    <p className="text-slate-500 font-medium">Connect, communicate, and close loads in real-time.</p>
                </div>

                {(currentUser?.role === 'broker' || currentUser?.role === 'admin') && (
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-[#ba0b0b] hover:bg-[#950606] shadow-xl shadow-[#ba0b0b]/20 px-6 h-12 rounded-xl transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus className="mr-2 h-5 w-5" />
                        Post New Load
                    </Button>
                )}
            </div>

            {jobs.length === 0 ? (
                <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-slate-300 shadow-inner">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Briefcase className="w-10 h-10 text-slate-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">The board is clear!</h2>
                    <p className="text-slate-500 max-w-sm mx-auto">Check back shortly or post a new load to start the momentum.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs.map((job) => (
                        <JobCard key={job.id} job={job} />
                    ))}
                </div>
            )}

            <CreateJobModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}

// Icon for empty state
function Briefcase(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
    );
}
