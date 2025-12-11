<?php

namespace App\Entity;

use App\Repository\AnswerRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: AnswerRepository::class)]
#[ORM\Table(name: 'answers')]
class Answer
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Response::class, inversedBy: 'answers')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Response $response = null;

    #[ORM\ManyToOne(targetEntity: Question::class, inversedBy: 'answers')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Question $question = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $textValue = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    private ?array $selectedOptions = null;

    #[ORM\Column(nullable: true)]
    private ?int $ratingValue = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getResponse(): ?Response
    {
        return $this->response;
    }

    public function setResponse(?Response $response): static
    {
        $this->response = $response;
        return $this;
    }

    public function getQuestion(): ?Question
    {
        return $this->question;
    }

    public function setQuestion(?Question $question): static
    {
        $this->question = $question;
        return $this;
    }

    public function getTextValue(): ?string
    {
        return $this->textValue;
    }

    public function setTextValue(?string $textValue): static
    {
        $this->textValue = $textValue;
        return $this;
    }

    public function getSelectedOptions(): ?array
    {
        return $this->selectedOptions;
    }

    public function setSelectedOptions(?array $selectedOptions): static
    {
        $this->selectedOptions = $selectedOptions;
        return $this;
    }

    public function getRatingValue(): ?int
    {
        return $this->ratingValue;
    }

    public function setRatingValue(?int $ratingValue): static
    {
        $this->ratingValue = $ratingValue;
        return $this;
    }

    public function getValue(): mixed
    {
        $type = $this->question?->getType();
        return match ($type) {
            Question::TYPE_TEXT => $this->textValue,
            Question::TYPE_RATING => $this->ratingValue,
            Question::TYPE_SINGLE_CHOICE, Question::TYPE_MULTIPLE_CHOICE => $this->selectedOptions,
            default => null,
        };
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'questionId' => $this->question?->getId(),
            'value' => $this->getValue(),
        ];
    }
}
