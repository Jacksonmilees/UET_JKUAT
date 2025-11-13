<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Traits\ApiResponses;
use Illuminate\Support\Facades\Log;

class ProjectController extends Controller
{
    use ApiResponses;

    public function index()
    {
        try {
            $projects = Project::with('donations')
                ->orderBy('created_at', 'desc')
                ->get();

            return $this->successResponse($projects);
        } catch (\Exception $e) {
            Log::error('Error fetching projects: ' . $e->getMessage());
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    public function store(StoreProjectRequest $request)
    {
        try {
            Log::debug('Request received:', [
                'all_data' => $request->all(),
                'headers' => $request->headers->all(),
                'method' => $request->method()
            ]);

            $validated = $request->validated();
            Log::debug('Data validated:', ['validated' => $validated]);

            $validated['current_amount'] = $validated['current_amount'] ?? 0;
            $validated['status'] = $validated['status'] ?? 'active';

            Log::debug('Attempting to create project', ['data' => $validated]);
            
            $project = Project::create($validated);
            
            if (!$project) {
                Log::error('Project creation failed');
                throw new \Exception('Failed to create project');
            }

            Log::debug('Project created:', ['project' => $project->toArray()]);
            
            return $this->successResponse($project, 'Project created successfully', 201);
        } catch (\Exception $e) {
            Log::error('Error in store method:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    public function show(Project $project)
    {
        return $this->successResponse($project->load('donations'));
    }

    public function update(UpdateProjectRequest $request, Project $project)
    {
        $project->update($request->validated());
        return $this->successResponse($project, 'Project updated successfully');
    }

    public function destroy(Project $project)
    {
        $project->delete();
        return $this->successResponse(null, 'Project deleted successfully');
    }
}