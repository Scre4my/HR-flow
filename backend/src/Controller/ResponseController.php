<?php

namespace App\Controller;

use App\Entity\Survey;
use App\Entity\Question;
use App\Entity\Response as SurveyResponse;
use App\Entity\Answer;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class ResponseController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {}

    #[Route('/surveys/{surveyId}/responses', name: 'response_list', methods: ['GET'], requirements: ['surveyId' => '\d+'])]
    public function list(int $surveyId): JsonResponse
    {
        $survey = $this->entityManager->getRepository(Survey::class)->find($surveyId);
        if (!$survey) {
            return $this->json(['error' => 'Survey not found'], Response::HTTP_NOT_FOUND);
        }

        $responses = $this->entityManager->getRepository(SurveyResponse::class)->findBy(
            ['survey' => $survey],
            ['submittedAt' => 'DESC']
        );

        $data = array_map(fn(SurveyResponse $r) => $r->toArray(), $responses);
        return $this->json($data);
    }

    #[Route('/surveys/{surveyId}/submit', name: 'response_submit', methods: ['POST'], requirements: ['surveyId' => '\d+'])]
    public function submit(int $surveyId, Request $request): JsonResponse
    {
        $survey = $this->entityManager->getRepository(Survey::class)->find($surveyId);
        if (!$survey) {
            return $this->json(['error' => 'Survey not found'], Response::HTTP_NOT_FOUND);
        }

        if (!$survey->isActive()) {
            return $this->json(['error' => 'Survey is not active'], Response::HTTP_BAD_REQUEST);
        }

        $data = json_decode($request->getContent(), true);
        $answers = $data['answers'] ?? [];

        $requiredQuestions = $survey->getQuestions()->filter(fn(Question $q) => $q->isRequired());
        foreach ($requiredQuestions as $question) {
            $found = false;
            foreach ($answers as $answer) {
                if (($answer['questionId'] ?? null) == $question->getId()) {
                    $value = $answer['value'] ?? null;
                    if ($value !== null && $value !== '' && $value !== []) {
                        $found = true;
                        break;
                    }
                }
            }
            if (!$found) {
                return $this->json([
                    'error' => 'Required question not answered',
                    'questionId' => $question->getId()
                ], Response::HTTP_BAD_REQUEST);
            }
        }

        $response = new SurveyResponse();
        $response->setSurvey($survey);
        $response->setIpAddress($request->getClientIp());

        foreach ($answers as $answerData) {
            $questionId = $answerData['questionId'] ?? null;
            $value = $answerData['value'] ?? null;

            if (!$questionId) continue;

            $question = $this->entityManager->getRepository(Question::class)->find($questionId);
            if (!$question || $question->getSurvey()->getId() !== $surveyId) continue;

            $answer = new Answer();
            $answer->setQuestion($question);

            switch ($question->getType()) {
                case Question::TYPE_TEXT:
                    $answer->setTextValue($value);
                    break;
                case Question::TYPE_RATING:
                    $answer->setRatingValue((int)$value);
                    break;
                case Question::TYPE_SINGLE_CHOICE:
                case Question::TYPE_MULTIPLE_CHOICE:
                    $options = is_array($value) ? $value : [$value];
                    $answer->setSelectedOptions($options);
                    break;
            }

            $response->addAnswer($answer);
        }

        $this->entityManager->persist($response);
        $this->entityManager->flush();

        return $this->json(['message' => 'Response submitted successfully', 'id' => $response->getId()], Response::HTTP_CREATED);
    }

    #[Route('/surveys/{surveyId}/statistics', name: 'response_statistics', methods: ['GET'], requirements: ['surveyId' => '\d+'])]
    public function statistics(int $surveyId): JsonResponse
    {
        $survey = $this->entityManager->getRepository(Survey::class)->find($surveyId);
        if (!$survey) {
            return $this->json(['error' => 'Survey not found'], Response::HTTP_NOT_FOUND);
        }

        $responses = $this->entityManager->getRepository(SurveyResponse::class)->findBy(['survey' => $survey]);
        $totalResponses = count($responses);

        $questionStats = [];
        foreach ($survey->getQuestions() as $question) {
            $stats = [
                'questionId' => $question->getId(),
                'text' => $question->getText(),
                'type' => $question->getType(),
                'totalAnswers' => 0,
            ];

            $answers = $question->getAnswers();
            $stats['totalAnswers'] = count($answers);

            switch ($question->getType()) {
                case Question::TYPE_RATING:
                    $ratings = [];
                    foreach ($answers as $answer) {
                        if ($answer->getRatingValue() !== null) {
                            $ratings[] = $answer->getRatingValue();
                        }
                    }
                    $stats['average'] = count($ratings) > 0 ? round(array_sum($ratings) / count($ratings), 2) : 0;
                    $stats['distribution'] = array_count_values($ratings);
                    break;

                case Question::TYPE_SINGLE_CHOICE:
                case Question::TYPE_MULTIPLE_CHOICE:
                    $optionCounts = [];
                    foreach ($answers as $answer) {
                        $selected = $answer->getSelectedOptions() ?? [];
                        foreach ($selected as $option) {
                            $optionCounts[$option] = ($optionCounts[$option] ?? 0) + 1;
                        }
                    }
                    $stats['optionCounts'] = $optionCounts;
                    break;

                case Question::TYPE_TEXT:
                    $textAnswers = [];
                    foreach ($answers as $answer) {
                        if ($answer->getTextValue()) {
                            $textAnswers[] = $answer->getTextValue();
                        }
                    }
                    $stats['answers'] = $textAnswers;
                    break;
            }

            $questionStats[] = $stats;
        }

        return $this->json([
            'surveyId' => $surveyId,
            'totalResponses' => $totalResponses,
            'questions' => $questionStats,
        ]);
    }
}
