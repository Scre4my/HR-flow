<?php

namespace App\Controller;

use App\Entity\Survey;
use App\Entity\Question;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/surveys')]
class SurveyController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {}

    #[Route('', name: 'survey_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $surveys = $this->entityManager->getRepository(Survey::class)->findBy([], ['createdAt' => 'DESC']);
        $data = array_map(fn(Survey $s) => $s->toArray(), $surveys);
        return $this->json($data);
    }

    #[Route('/active', name: 'survey_list_active', methods: ['GET'])]
    public function listActive(): JsonResponse
    {
        $surveys = $this->entityManager->getRepository(Survey::class)->findAllActive();
        $data = array_map(fn(Survey $s) => $s->toArray(), $surveys);
        return $this->json($data);
    }

    #[Route('/{id}', name: 'survey_show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id): JsonResponse
    {
        $survey = $this->entityManager->getRepository(Survey::class)->find($id);
        if (!$survey) {
            return $this->json(['error' => 'Survey not found'], Response::HTTP_NOT_FOUND);
        }
        return $this->json($survey->toArrayWithQuestions());
    }

    #[Route('', name: 'survey_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['title'])) {
            return $this->json(['error' => 'Title is required'], Response::HTTP_BAD_REQUEST);
        }

        $survey = new Survey();
        $survey->setTitle($data['title']);
        $survey->setDescription($data['description'] ?? null);
        $survey->setIsActive($data['isActive'] ?? true);
        $survey->setSurveyType($data['surveyType'] ?? 'single_page');
        $survey->setPages($data['pages'] ?? null);
        $survey->setTransitions($data['transitions'] ?? null);

        if (!empty($data['questions'])) {
            foreach ($data['questions'] as $index => $qData) {
                $question = new Question();
                $question->setText($qData['text'] ?? '');
                $question->setType($qData['type'] ?? Question::TYPE_TEXT);
                $question->setOptions($qData['options'] ?? null);
                $question->setIsRequired($qData['isRequired'] ?? true);
                $question->setPosition($qData['position'] ?? $index);
                $question->setPageNumber($qData['pageNumber'] ?? null);
                $survey->addQuestion($question);
            }
        }

        $this->entityManager->persist($survey);
        $this->entityManager->flush();

        return $this->json($survey->toArrayWithQuestions(), Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'survey_update', methods: ['PUT', 'PATCH'], requirements: ['id' => '\d+'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $survey = $this->entityManager->getRepository(Survey::class)->find($id);
        if (!$survey) {
            return $this->json(['error' => 'Survey not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['title'])) {
            $survey->setTitle($data['title']);
        }
        if (isset($data['description'])) {
            $survey->setDescription($data['description']);
        }
        if (isset($data['isActive'])) {
            $survey->setIsActive($data['isActive']);
        }
        if (isset($data['surveyType'])) {
            $survey->setSurveyType($data['surveyType']);
        }
        if (isset($data['pages'])) {
            $survey->setPages($data['pages']);
        }
        if (isset($data['transitions'])) {
            $survey->setTransitions($data['transitions']);
        }

        if (isset($data['questions'])) {
            foreach ($survey->getQuestions() as $question) {
                $survey->removeQuestion($question);
            }

            foreach ($data['questions'] as $index => $qData) {
                $question = new Question();
                $question->setText($qData['text'] ?? '');
                $question->setType($qData['type'] ?? Question::TYPE_TEXT);
                $question->setOptions($qData['options'] ?? null);
                $question->setIsRequired($qData['isRequired'] ?? true);
                $question->setPosition($qData['position'] ?? $index);
                $question->setPageNumber($qData['pageNumber'] ?? null);
                $survey->addQuestion($question);
            }
        }

        $survey->setUpdatedAt(new \DateTime());
        $this->entityManager->flush();

        return $this->json($survey->toArrayWithQuestions());
    }

    #[Route('/{id}', name: 'survey_delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(int $id): JsonResponse
    {
        $survey = $this->entityManager->getRepository(Survey::class)->find($id);
        if (!$survey) {
            return $this->json(['error' => 'Survey not found'], Response::HTTP_NOT_FOUND);
        }

        $this->entityManager->remove($survey);
        $this->entityManager->flush();

        return $this->json(['message' => 'Survey deleted successfully']);
    }

    #[Route('/{id}/toggle', name: 'survey_toggle', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function toggle(int $id): JsonResponse
    {
        $survey = $this->entityManager->getRepository(Survey::class)->find($id);
        if (!$survey) {
            return $this->json(['error' => 'Survey not found'], Response::HTTP_NOT_FOUND);
        }

        $survey->setIsActive(!$survey->isActive());
        $survey->setUpdatedAt(new \DateTime());
        $this->entityManager->flush();

        return $this->json($survey->toArray());
    }
}
