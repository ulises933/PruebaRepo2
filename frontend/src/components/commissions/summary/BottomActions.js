import React from "react";
import { Button, CircularProgress, Pagination } from "@mui/material";
import {
  BottomActionsContainer,
  PaginationWrapper,
  ActionButtonsWrapper,
  buttonStyles,
} from "../styles/CommissionsStyles";

export const BottomActions = React.memo(
  ({
    pageCount,
    page,
    onPageChange,
    onSave,
    onGenerateCut,
    isSaving,
    isGeneratingCut,
    t,
  }) => (
    <BottomActionsContainer>
      <PaginationWrapper>
        <Pagination
          count={pageCount}
          page={page}
          onChange={onPageChange}
          color="primary"
          size="small"
        />
      </PaginationWrapper>

      <ActionButtonsWrapper>
        <Button
          variant="contained"
          onClick={onSave}
          disabled={isSaving || isGeneratingCut}
          sx={buttonStyles}
          title={t("saveChanges")}
        >
          {isSaving && <CircularProgress size={24} />}
          {t("saveChanges")}
        </Button>
        <Button
          variant="contained"
          onClick={onGenerateCut}
          disabled={isSaving || isGeneratingCut}
          sx={buttonStyles}
          title={t("generateMonthlyCut")}
        >
          {isGeneratingCut && <CircularProgress size={24} />}
          {t("generateMonthlyCut")}
        </Button>
      </ActionButtonsWrapper>
    </BottomActionsContainer>
  )
);
