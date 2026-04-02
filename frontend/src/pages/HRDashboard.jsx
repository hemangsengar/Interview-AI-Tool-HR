import { useState } from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { jobService } from '../api/services'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Skeleton } from '../components/ui/Skeleton'
import { 
  Plus, 
  Briefcase, 
  Users, 
  ExternalLink, 
  Search, 
  LayoutGrid, 
  List as ListIcon,
  Filter,
  ArrowRight
} from 'lucide-react'

const HRDashboard = () => {
  const [showCreateJob, setShowCreateJob] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid')

  const [formData, setFormData] = useState({
    title: '',
    jd_raw_text: '',
    must_have_skills: '',
    good_to_have_skills: ''
  })

  const { data: jobs, isLoading, refetch } = useQuery(
    'jobs',
    () => jobService.list().then(res => res.data),
    {
      retry: 1
    }
  )

  const handleCreateJob = async (e) => {
    e.preventDefault()
    try {
      const response = await jobService.create({
        ...formData,
        must_have_skills: formData.must_have_skills.split(',').map(s => s.trim()).filter(Boolean),
        good_to_have_skills: formData.good_to_have_skills.split(',').map(s => s.trim()).filter(Boolean)
      })
      setShowCreateJob(false)
      setFormData({ title: '', jd_raw_text: '', must_have_skills: '', good_to_have_skills: '' })
      refetch()

      if (response.data.job_code) {
        toast.success(`Job created successfully!`, {
          description: `Job Code: ${response.data.job_code}. Share this with candidates.`,
          duration: 10000,
        })
      }
    } catch (err) {
      console.error('Job creation error:', err)
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to create job.'
      toast.error(errorMsg)
    }
  }

  const filteredJobs = jobs?.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.job_code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-reveal-up">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-display font-bold text-stone-900 mb-2">My Opportunities</h1>
          <p className="text-stone-500 font-medium">Manage and track your active interview sessions</p>
        </div>
        <Button 
          onClick={() => setShowCreateJob(true)}
          variant="premium" 
          size="lg"
          className="h-14 px-8 shadow-lg"
        >
          <Plus className="mr-2 w-5 h-5" />
          Create New Job
        </Button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest leading-none mb-1">Active Roles</p>
              <p className="text-2xl font-bold text-stone-900">{jobs?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-secondary/5 border-secondary/20">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest leading-none mb-1">Total Candidates</p>
              <p className="text-2xl font-bold text-stone-900">
                {jobs?.reduce((acc, job) => acc + (job.candidates_count || 0), 0) || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-accent/5 border-accent/20">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
              <ArrowRight className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest leading-none mb-1">Avg. Completion</p>
              <p className="text-2xl font-bold text-stone-900">84%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input 
            type="text"
            placeholder="Search roles or job codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-12 pr-4 text-sm text-stone-900 focus:border-primary/50 focus:ring-0 transition-all outline-none"
          />
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex bg-stone-50 p-1 rounded-xl border border-stone-200">
            <button 
              onClick={() => setViewMode('grid')}
              className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-white text-stone-900 shadow-sm" : "text-stone-400 hover:text-stone-600")}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-white text-stone-900 shadow-sm" : "text-stone-400 hover:text-stone-600")}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
          <Button variant="outline" size="sm" className="border-stone-200 text-stone-500">
            <Filter className="mr-2 w-4 h-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Jobs List Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-64 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "flex flex-col gap-4"
        )}>
          {filteredJobs?.map((job) => (
            <Card key={job.id} className="hover:border-primary/30 transition-all group overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-center text-2xl group-hover:bg-primary/5 transition-colors">
                      💼
                    </div>
                    <div className="bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase py-1 px-3 rounded-lg border border-emerald-100">
                      Active
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 mb-2 group-hover:text-primary transition-colors">{job.title}</h3>
                  <div className="flex items-center gap-2 mb-6">
                    <p className="text-xs text-stone-500 font-medium">Job Code:</p>
                    <code className="text-xs font-mono text-primary bg-orange-50 px-2 py-0.5 rounded border border-orange-100">{job.job_code}</code>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-stone-100">
                    <div className="flex items-center gap-4">
                       <div className="text-center">
                         <p className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">Candidates</p>
                         <p className="text-lg font-bold text-stone-900">{job.candidates_count || 0}</p>
                       </div>
                    </div>
                    <Link to={`/job/${job.id}`}>
                       <Button variant="premium" size="sm" className="rounded-lg h-10 px-4">
                         Details
                         <ExternalLink className="ml-2 w-4 h-4" />
                       </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Jobs Placeholder */}
      {!isLoading && filteredJobs?.length === 0 && (
        <div className="py-32 text-center">
          <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-stone-100">
             <Briefcase className="w-10 h-10 text-stone-300" />
          </div>
          <h3 className="text-xl font-bold text-stone-900 mb-2">No matching jobs found</h3>
          <p className="text-stone-500 mb-8">Try adjusting your filters or create a new role.</p>
          <Button variant="premium" onClick={() => setShowCreateJob(true)}>
             Create Your First Role
          </Button>
        </div>
      )}

      {/* Create Job Drawer/Modal Overlay */}
      {showCreateJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-stone-900/20 backdrop-blur-sm">
          <div className="w-full max-w-2xl animate-reveal-up">
            <Card className="border-stone-200 shadow-2xl bg-white">
              <CardContent className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-stone-900">Define New Opportunity</h2>
                  <button onClick={() => setShowCreateJob(false)} className="text-stone-400 hover:text-stone-900 transition-colors">
                    <Plus className="w-6 h-6 rotate-45" />
                  </button>
                </div>
                
                <form onSubmit={handleCreateJob} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest pl-1">Job Title</label>
                    <Input 
                      required
                      placeholder="e.g. Senior Fullstack Engineer"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest pl-1">Description & Requirements</label>
                    <textarea 
                      required
                      rows={4}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-stone-900 placeholder:text-stone-400 focus:border-primary/50 focus:ring-0 transition-all outline-none resize-none"
                      placeholder="Paste the full job description or core focus areas..."
                      value={formData.jd_raw_text}
                      onChange={(e) => setFormData({...formData, jd_raw_text: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-widest pl-1">Must Have Skills</label>
                      <Input 
                        placeholder="React, Go, AWS..."
                        value={formData.must_have_skills}
                        onChange={(e) => setFormData({...formData, must_have_skills: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-widest pl-1">Bonus Skills</label>
                      <Input 
                        placeholder="Kubernetes, Python..."
                        value={formData.good_to_have_skills}
                        onChange={(e) => setFormData({...formData, good_to_have_skills: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <Button 
                      type="button"
                      variant="outline" 
                      className="flex-1 h-14 border-stone-200" 
                      onClick={() => setShowCreateJob(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      variant="premium" 
                      className="flex-1 h-14"
                    >
                      Create & Publish
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

export default HRDashboard
