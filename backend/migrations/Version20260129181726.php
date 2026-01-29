<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260129181726 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE questions ADD page_number INT DEFAULT NULL');
        $this->addSql('ALTER TABLE surveys ADD survey_type VARCHAR(20) NOT NULL');
        $this->addSql('ALTER TABLE surveys ADD pages JSON DEFAULT NULL');
        $this->addSql('ALTER TABLE surveys ADD transitions JSON DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE questions DROP page_number');
        $this->addSql('ALTER TABLE surveys DROP survey_type');
        $this->addSql('ALTER TABLE surveys DROP pages');
        $this->addSql('ALTER TABLE surveys DROP transitions');
    }
}
