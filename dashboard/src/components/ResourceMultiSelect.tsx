import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import type { PaperProps } from '@mui/material/Paper'
import type { ReactNode, SyntheticEvent } from 'react'
import { forwardRef, useMemo } from 'react'

declare module '@mui/material/Autocomplete' {
  interface AutocompletePaperSlotPropsOverrides {
    toolbar?: ReactNode
  }
}

export type ResourceMultiSelectOption = {
  value: string
  label: string
  description?: string
}

type ResourceMultiSelectProps = {
  label: string
  placeholder?: string
  options: ResourceMultiSelectOption[]
  selectedValues: string[]
  onChange: (values: string[]) => void
  disabled?: boolean
  loading?: boolean
  error?: string | null
  emptyIcon?: ReactNode
  emptyMessage?: string
}

type MultiSelectPaperProps = PaperProps & {
  toolbar?: ReactNode
}

const checkboxIcon = <CheckBoxOutlineBlankIcon fontSize="small" />
const checkboxCheckedIcon = <CheckBoxIcon fontSize="small" />

const MultiSelectPaper = forwardRef<HTMLDivElement, MultiSelectPaperProps>(
  function MultiSelectPaper({ toolbar, children, ...other }, ref) {
    return (
      <Paper ref={ref} {...other}>
        {toolbar}
        {children}
      </Paper>
    )
  },
)

export default function ResourceMultiSelect({
  label,
  placeholder,
  options,
  selectedValues,
  onChange,
  disabled = false,
  loading = false,
  error = null,
  emptyIcon,
  emptyMessage = 'No options available.',
}: ResourceMultiSelectProps) {
  const optionByValue = useMemo(
    () => new Map(options.map((option) => [option.value, option])),
    [options],
  )

  const selectedOptions = useMemo(
    () =>
      selectedValues.map(
        (value) => optionByValue.get(value) ?? { value, label: value },
      ),
    [optionByValue, selectedValues],
  )

  function handleChange(
    _event: SyntheticEvent,
    nextSelected: ResourceMultiSelectOption[],
  ) {
    onChange(nextSelected.map((option) => option.value))
  }

  const helperText =
    selectedValues.length > 0
      ? `${selectedValues.length} selected`
      : '(optional)'

  const toolbar =
    options.length > 0 ? (
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          px: 1.5,
          py: 0.75,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Button
          size="small"
          disabled={disabled || selectedValues.length === options.length}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onChange(options.map((option) => option.value))}
        >
          Select all
        </Button>
        <Button
          size="small"
          disabled={disabled || selectedValues.length === 0}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onChange([])}
        >
          Clear
        </Button>
      </Box>
    ) : null

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && options.length === 0 ? (
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            {label}
          </Typography>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 1,
            }}
          >
            {emptyIcon}
            <Typography variant="body1" color="text.secondary">
              {emptyMessage}
            </Typography>
          </Paper>
        </Box>
      ) : (
        <Autocomplete
          multiple
          disableCloseOnSelect
          fullWidth
          options={options}
          value={selectedOptions}
          onChange={handleChange}
          loading={loading}
          disabled={disabled}
          limitTags={4}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          getOptionLabel={(option) => option.label}
          filterOptions={(available, { inputValue }) => {
            const query = inputValue.trim().toLowerCase()
            if (!query) return available

            return available.filter(
              (option) =>
                option.label.toLowerCase().includes(query) ||
                option.description?.toLowerCase().includes(query),
            )
          }}
          noOptionsText="No matching options"
          slots={{ paper: MultiSelectPaper }}
          slotProps={{
            chip: { size: 'small' },
            paper: { toolbar },
          }}
          renderOption={(props, option, { selected }) => {
            const { key, ...optionProps } = props

            return (
              <Box
                component="li"
                key={key}
                {...optionProps}
                sx={{ alignItems: option.description ? 'flex-start' : 'center' }}
              >
                <Checkbox
                  icon={checkboxIcon}
                  checkedIcon={checkboxCheckedIcon}
                  checked={selected}
                  disabled={disabled}
                  sx={{ mr: 1, mt: option.description ? 0.25 : 0 }}
                />
                <Box>
                  <Typography variant="body1">{option.label}</Typography>
                  {option.description && (
                    <Typography variant="body2" color="text.secondary">
                      {option.description}
                    </Typography>
                  )}
                </Box>
              </Box>
            )
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              placeholder={selectedOptions.length === 0 ? placeholder : undefined}
              helperText={helperText}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                }
              }}
            />
          )}
        />
      )}
    </Box>
  )
}
