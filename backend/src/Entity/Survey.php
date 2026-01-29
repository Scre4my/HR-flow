<?php

namespace App\Entity;

use App\Repository\SurveyRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: SurveyRepository::class)]
#[ORM\Table(name: 'surveys')]
class Survey
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $title = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $description = null;

    #[ORM\Column]
    private bool $isActive = true;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $updatedAt = null;

    #[ORM\Column(length: 20)]
    private string $surveyType = 'single_page';

    #[ORM\Column(type: Types::JSON, nullable: true)]
    private ?array $pages = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    private ?array $transitions = null;

    #[ORM\OneToMany(targetEntity: Question::class, mappedBy: 'survey', cascade: ['persist', 'remove'], orphanRemoval: true)]
    #[ORM\OrderBy(['position' => 'ASC'])]
    private Collection $questions;

    #[ORM\OneToMany(targetEntity: Response::class, mappedBy: 'survey', cascade: ['remove'])]
    private Collection $responses;

    public function __construct()
    {
        $this->questions = new ArrayCollection();
        $this->responses = new ArrayCollection();
        $this->createdAt = new \DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;
        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;
        return $this;
    }

    public function isActive(): bool
    {
        return $this->isActive;
    }

    public function setIsActive(bool $isActive): static
    {
        $this->isActive = $isActive;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeInterface $createdAt): static
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeInterface
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?\DateTimeInterface $updatedAt): static
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }

    public function getSurveyType(): string
    {
        return $this->surveyType;
    }

    public function setSurveyType(string $surveyType): static
    {
        $this->surveyType = $surveyType;
        return $this;
    }

    public function getPages(): ?array
    {
        return $this->pages;
    }

    public function setPages(?array $pages): static
    {
        $this->pages = $pages;
        return $this;
    }

    public function getTransitions(): ?array
    {
        return $this->transitions;
    }

    public function setTransitions(?array $transitions): static
    {
        $this->transitions = $transitions;
        return $this;
    }

    public function getQuestions(): Collection
    {
        return $this->questions;
    }

    public function addQuestion(Question $question): static
    {
        if (!$this->questions->contains($question)) {
            $this->questions->add($question);
            $question->setSurvey($this);
        }
        return $this;
    }

    public function removeQuestion(Question $question): static
    {
        if ($this->questions->removeElement($question)) {
            if ($question->getSurvey() === $this) {
                $question->setSurvey(null);
            }
        }
        return $this;
    }

    public function getResponses(): Collection
    {
        return $this->responses;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'isActive' => $this->isActive,
            'surveyType' => $this->surveyType,
            'pages' => $this->pages,
            'transitions' => $this->transitions,
            'createdAt' => $this->createdAt?->format('Y-m-d H:i:s'),
            'updatedAt' => $this->updatedAt?->format('Y-m-d H:i:s'),
            'questionsCount' => $this->questions->count(),
            'responsesCount' => $this->responses->count(),
        ];
    }

    public function toArrayWithQuestions(): array
    {
        $data = $this->toArray();
        $data['questions'] = array_map(fn(Question $q) => $q->toArray(), $this->questions->toArray());
        return $data;
    }
}
